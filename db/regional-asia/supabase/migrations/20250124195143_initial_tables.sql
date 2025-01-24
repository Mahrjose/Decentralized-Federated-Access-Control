-- Create users Table
CREATE TABLE users (
    UserID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Username VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(15),
    Role VARCHAR(50) NOT NULL,
    RoleAttributes JSONB,
    Attributes JSONB,
    LastLogin TIMESTAMP,
    Status VARCHAR(50) DEFAULT 'Active',
    MfaEnabled BOOLEAN DEFAULT false,
    AccountLocked BOOLEAN DEFAULT false,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastPasswordChange TIMESTAMP,
    FailedLoginAttempts INT DEFAULT 0
);

-- Create policies Table
CREATE TABLE policies (
    policyid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policyname VARCHAR(255) NOT NULL,
    description TEXT,
    rules JSONB NOT NULL,
    scope TEXT NOT NULL,
    targetnodes TEXT,
    region TEXT,
    branch TEXT
);