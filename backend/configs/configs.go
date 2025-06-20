package configs

import (
	"errors"

	"github.com/caarlos0/env/v6"
	"github.com/joho/godotenv"
)

type Config struct {
	ENV             string          `env:"ENV" envDefault:"dev"`
	PORT            string          `env:"PORT" envDefault:"8080"`
	PostgresConfig  PostgresConfig  `envPrefix:"POSTGRES_"`
	JWT             JWTConfig       `envPrefix:"JWT_"`
	RedisConfig     RedisConfig     `envPrefix:"REDIS_"`
	MidtransConfig  MidtransConfig  `envPrefix:"MIDTRANS_"`
	GoogleConfig    GoogleConfig    `envPrefix:"GOOGLE_"`
	SMPTGmailConfig SMPTGmailConfig `envPrefix:"SMTP_GMAIL_"`
}

type RedisConfig struct {
	Host     string `env:"HOST" envDefault:"localhost"`
	Port     string `env:"PORT" envDefault:"6379"`
	Password string `env:"PASSWORD" envDefault:""`
}

type JWTConfig struct {
	SecretKey string `env:"SECRET_KEY" envDefault:"secret"`
}

type PostgresConfig struct {
	Host     string `env:"HOST" envDefault:"localhost"`
	Port     string `env:"PORT" envDefault:"5432"`
	User     string `env:"USER" envDefault:"postgres"`
	Password string `env:"PASSWORD" envDefault:"postgres"`
	Database string `env:"DATABASE" envDefault:"postgres"`
}

type MidtransConfig struct {
	ServerKey string `env:"SERVER_KEY" envDefault:""`
	ClientKey string `env:"CLIENT_KEY" envDefault:""`
}

type GoogleConfig struct {
	ClientID     string `env:"CLIENT_ID" envDefault:""`
	ClientSecret string `env:"CLIENT_SECRET" envDefault:""`
}

type SMPTGmailConfig struct {
	Email    string `env:"EMAIL" envDefault:""`
	Password string `env:"PASSWORD" envDefault:""`
}

func NewConfig(envPath string) (*Config, error) {
	err := godotenv.Load(envPath)
	if err != nil {
		return nil, errors.New("failed to load env")
	}

	cfg := new(Config)
	err = env.Parse(cfg)
	if err != nil {
		return nil, errors.New("failed to parse env")
	}
	return cfg, nil
}
