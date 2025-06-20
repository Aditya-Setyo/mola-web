package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"mola-web/configs"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"
	"mola-web/internal/repository"
	"mola-web/pkg/cache"
	"mola-web/pkg/token"
	"net/smtp"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/idtoken"
	"gorm.io/gorm"
)

type UserService interface {
	Login(ctx context.Context, request *dto.LoginRequest) (string, error)
	GoogleLogin(ctx context.Context, request *dto.GoogleLoginRequest) (string, error)
	Register(ctx context.Context, req *dto.RegisterRequest) error
	GetAll(ctx context.Context) ([]dto.GetAllUserResponse, error)
	GetUserProfile(ctx context.Context, userID uuid.UUID) (*dto.GetUserProfileResponse, error)
	UpdateUserProfile(ctx context.Context, UserID uuid.UUID, request *dto.UpdateUserProfileRequest) error
	GetUserAddress(ctx context.Context, userID uuid.UUID) (*dto.GetUserAddressResponse, error)
	UpdateUserAddress(ctx context.Context, userID uuid.UUID, userAddress *dto.UpdateUserAddressRequest) error
	ForgotPassword(ctx context.Context, request string) error
	// ForgotPasswordToken(ctx context.Context, request string) error
}

type userService struct {
	DB             *gorm.DB
	userRepository repository.UserRepository
	tokenUseCase   token.TokenUseCase
	cacheable      cache.Cacheable
	GoogleConfigs  configs.GoogleConfig
	SMTPConfigs    configs.SMPTGmailConfig
}

func NewUserService(
	db *gorm.DB,
	userRepository repository.UserRepository,
	tokenUseCase token.TokenUseCase,
	cacheable cache.Cacheable,
	GoogleConfigs configs.GoogleConfig,
	SMTPConfigs configs.SMPTGmailConfig,
) UserService {
	return &userService{
		DB:             db,
		userRepository: userRepository,
		tokenUseCase:   tokenUseCase,
		cacheable:      cacheable,
		GoogleConfigs:  GoogleConfigs,
		SMTPConfigs:    SMTPConfigs,
	}
}

func (s *userService) Register(ctx context.Context, req *dto.RegisterRequest) error {
	// Periksa apakah email sudah ada
	_, err := s.userRepository.FindByEmail(ctx, req.Email)
	if err == nil {
		return errors.New("email already exists")
	}

	// Hash password sebelum disimpan
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash password")
	}
	tx := s.DB.WithContext(ctx).Begin()
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Printf("PANIC RECOVERED: Rolling back transaction due to panic: %v", p)
			panic(p)
		} else if tx.Error != nil {
			tx.Rollback()
			log.Printf("ERROR: Rolling back transaction due to service error: %v", tx.Error)
		}
	}()
	user := &entity.User{
		Email:    req.Email,
		Name:     req.Name,
		Password: string(hashedPassword),
		Role:     "user",
	}
	err = s.userRepository.Create(tx, user)
	if err != nil {
		tx.Error = err
		return err
	}
	err = s.userRepository.UpdateUserProfile(tx, &entity.UserProfile{
		UserID:      &user.ID,
		PhoneNumber: &req.PhoneNumber,
	})
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	return nil
}

func (s *userService) Login(ctx context.Context, request *dto.LoginRequest) (string, error) {
	user, err := s.userRepository.FindByEmail(ctx, request.Email)
	if err != nil {
		return "", errors.New("email or password invalid")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
		return "", errors.New("email or password invalid")
	}

	expiredTime := time.Now().Local().Add(time.Minute * 60)

	claims := token.JwtCustomClaims{
		UserID: user.ID,
		Name:   user.Name,
		Role:   user.Role,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "mola-web",
			ExpiresAt: jwt.NewNumericDate(expiredTime),
		},
	}

	token, err := s.tokenUseCase.GenerateAccessToken(claims)
	if err != nil {
		return "", errors.New("ada kesalahan di server")
	}
	return token, nil
}

func (s *userService) GoogleLogin(ctx context.Context, request *dto.GoogleLoginRequest) (string, error) {
	payload, err := idtoken.Validate(context.Background(), request.IdToken, s.GoogleConfigs.ClientID)
	if err != nil {
		return "", errors.New("invalid Google token")
	}

	email, _ := payload.Claims["email"].(string)
	if email == "" {
		return "", errors.New("email not found in token")
	}
	user, err := s.userRepository.FindByEmail(ctx, email)
	if err != nil {
		s.userRepository.Create(s.DB, &entity.User{
			Email: email,
			Name:  payload.Claims["name"].(string),
			Role:  "user",
		})
	}

	expiredTime := time.Now().Local().Add(time.Minute * 60)

	claims := token.JwtCustomClaims{
		UserID: user.ID,
		Name:   user.Name,
		Role:   user.Role,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "mola-web",
			ExpiresAt: jwt.NewNumericDate(expiredTime),
		},
	}
	token, err := s.tokenUseCase.GenerateAccessToken(claims)
	if err != nil {
		return "", errors.New("ada kesalahan di server")
	}
	return token, nil
}

func (s *userService) GetAll(ctx context.Context) ([]dto.GetAllUserResponse, error) {
	key := "users:all"

	data := s.cacheable.Get(key)
	if data != "" {
		var cached []dto.GetAllUserResponse
		if err := json.Unmarshal([]byte(data), &cached); err == nil {
			return cached, nil
		}
	}

	// Ambil dari database
	dataUser, err := s.userRepository.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch users: %w", err)
	}
	if len(dataUser) == 0 {
		return nil, errors.New("no users found")
	}

	results := make([]dto.GetAllUserResponse, len(dataUser))
	for i, user := range dataUser {
		results[i] = dto.GetAllUserResponse{
			UserID:    user.ID,
			ProfileID: user.UserProfile.ID,
			FullName:  user.UserProfile.FullName,
			Name:  user.Name,
			Email: user.Email,
			Phone: *user.UserProfile.PhoneNumber,
		}
	}

	// Simpan data ke cache
	marshalledData, err := json.Marshal(results)
	if err == nil {
		_ = s.cacheable.Set(key, marshalledData)
	}
	
	return results, nil

}

func (s *userService) GetUserProfile(ctx context.Context, userID uuid.UUID) (*dto.GetUserProfileResponse, error) {
	key := "users:profile:" + userID.String()

	data := s.cacheable.Get(key)
	if data != "" {
		var cached dto.GetUserProfileResponse
		if err := json.Unmarshal([]byte(data), &cached); err == nil {
			return &cached, nil
		}
	}

	// Ambil dari database
	dataUser, err := s.userRepository.GetUserProfile(ctx, userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("user not found")
	} else if err != nil {
		return nil, err
	}

	// Inisialisasi response
	results := &dto.GetUserProfileResponse{
		ProfileID: uuid.Nil,
		Name:      dataUser.Name,
		Email:     dataUser.Email,
	}

	if dataUser.UserProfile != nil {
		results.ProfileID = dataUser.UserProfile.ID
		results.FullName = dataUser.UserProfile.FullName
		if dataUser.UserProfile.PhoneNumber != nil {
			results.Phone = *dataUser.UserProfile.PhoneNumber
		}
	}

	if dataUser.UserAddresses != nil {
		results.Address = dataUser.UserAddresses.AddressLine1
	}

	// Simpan ke cache
	marshalledData, err := json.Marshal(results)
	if err == nil {
		_ = s.cacheable.Set(key, marshalledData)
	}

	return results, nil
}

func (s *userService) UpdateUserProfile(ctx context.Context, userID uuid.UUID, request *dto.UpdateUserProfileRequest) error {
	tx := s.DB.WithContext(ctx).Begin()
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Printf("PANIC RECOVERED: Rolling back transaction due to panic: %v", p)
			panic(p)
		} else if tx.Error != nil {
			tx.Rollback()
			log.Printf("ERROR: Rolling back transaction due to service error: %v", tx.Error)
		}
	}()
	userProfile := &entity.UserProfile{
		ID:          request.ProfileID,
		UserID:      &userID,
		FullName:    request.FullName,
		PhoneNumber: &request.Phone,
	}
	err := s.userRepository.UpdateUserProfile(tx, userProfile)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "users:profile:" + userID.String()
	_ = s.cacheable.Delete(key)
	return nil
}

func (s *userService) GetUserAddress(ctx context.Context, userID uuid.UUID) (*dto.GetUserAddressResponse, error) {
	key := "users:address:" + userID.String()

	data := s.cacheable.Get(key)
	if data != "" {
		var cached dto.GetUserAddressResponse
		if err := json.Unmarshal([]byte(data), &cached); err == nil {
			return &cached, nil
		}
	}

	var results *dto.GetUserAddressResponse

	dataAddress, err := s.userRepository.GetUserAddress(ctx, userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		results = &dto.GetUserAddressResponse{
			ID:           uuid.Nil,
			AddressLine1: "",
			AddressLine2: "",
			City:         "",
			State:        "",
			PostalCode:   "",
			Country:      "",
			IsDefault:    false,
		}
		return results, nil
	} else if err != nil {
		return nil, err
	} else {

		results = &dto.GetUserAddressResponse{
			ID:           dataAddress.ID,
			AddressLine1: dataAddress.AddressLine1,
			AddressLine2: *dataAddress.AddressLine2,
			City:         dataAddress.City,
			State:        dataAddress.State,
			PostalCode:   dataAddress.PostalCode,
			Country:      dataAddress.Country,
			IsDefault:    dataAddress.IsDefault,
		}
	}
	marshalledData, err := json.Marshal(results)
	if err == nil {
		_ = s.cacheable.Set(key, marshalledData)
	}

	return results, nil
}

func (s *userService) UpdateUserAddress(ctx context.Context, userID uuid.UUID, request *dto.UpdateUserAddressRequest) error {
	tx := s.DB.WithContext(ctx).Begin()
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Printf("PANIC RECOVERED: Rolling back transaction due to panic: %v", p)
			panic(p)
		} else if tx.Error != nil {
			tx.Rollback()
			log.Printf("ERROR: Rolling back transaction due to service error: %v", tx.Error)
		}
	}()
	address := &entity.UserAddress{
		ID:           request.ID,
		UserID:       &userID,
		AddressLine1: request.Address,
	}
	err := s.userRepository.UpdateUserAddress(tx, address)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	return nil
}

func (s *userService) ForgotPassword(ctx context.Context, email string) error {
	tx := s.DB.WithContext(ctx).Begin()
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Printf("PANIC RECOVERED: Rolling back transaction due to panic: %v", p)
			panic(p)
		} else if tx.Error != nil {
			tx.Rollback()
			log.Printf("ERROR: Rolling back transaction due to service error: %v", tx.Error)
		}
	}()
	user, err := s.userRepository.FindByEmail(ctx, email)
	if err != nil {
		tx.Error = err
		return errors.New("user not found")
	}

	// Buat token dan simpan
	idToken := uuid.New().String()                         // contoh: "c623a7be-3b13-4f0d-86f1-0123456789ab"
	shortToken := strings.ReplaceAll(idToken, "-", "")[:8] // ambil 8 karakter pertama
	token := shortToken
	user.ResetToken = token
	user.ResetTokenExp = time.Now().Add(15 * time.Minute)
	s.userRepository.UpdateUser(tx, user)

	// Kirim email
	resetLink := fmt.Sprintf("http://localhost:8080/api/v1/forgot-password/token/%s", token) //atur dulu gengs
	if err := s.sendResetEmail(user.Email, resetLink); err != nil {
		tx.Error = err
		log.Printf("ERROR: Gagal mengirim email: %v", err)
		return errors.New("gagal mengirim email")
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	return nil
}

func (s *userService) sendResetEmail(toEmail, resetLink string) error {
	from := s.SMTPConfigs.Email
	password := s.SMTPConfigs.Password
	log.Println("Sending email from", from, password)

	msg := "Subject: Reset Password Request\n\n" +
		"Silakan klik link berikut untuk mengatur ulang password Anda:\n" + resetLink

	auth := smtp.PlainAuth("", from, password, "smtp.gmail.com")
	return smtp.SendMail("smtp.gmail.com:587", auth, from, []string{toEmail}, []byte(msg))
}

// func (s *userService) ForgotPasswordToken(ctx context.Context, resetToken string) error {
// 	tx := s.DB.WithContext(ctx).Begin()
// 	defer func() {
// 		if p := recover(); p != nil {
// 			tx.Rollback()
// 			log.Printf("PANIC RECOVERED: Rolling back transaction due to panic: %v", p)
// 			panic(p)
// 		} else if tx.Error != nil {
// 			tx.Rollback()
// 			log.Printf("ERROR: Rolling back transaction due to service error: %v", tx.Error)
// 		}
// 	}()

// 	user, err := s.userRepository.FindByResetToken(ctx, resetToken)
// 	if err != nil {
// 		tx.Error = err
// 		return errors.New("user not found")
// 	}

// 	if err := tx.Commit().Error; err != nil {
// 		tx.Error = err
// 		return err
// 	}
// 	return nil
// }
