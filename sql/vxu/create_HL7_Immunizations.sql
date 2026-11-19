CREATE TABLE HL7_Immunizations (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    filler_order        VARCHAR(50)  NOT NULL UNIQUE,   -- ORC.3: the unique ID of the shot
    last_message_id     VARCHAR(50),                    -- MSH.10
    sending_facility    VARCHAR(50),                    -- MSH.4.1
    mrn                 VARCHAR(50),                    -- PID.3.1 (MR)
    last_name           VARCHAR(100),                   -- PID.5.1
    first_name          VARCHAR(100),                   -- PID.5.2
    dob                 DATE,                           -- PID.7
    sex                 VARCHAR(5),                     -- PID.8
    admin_datetime      DATETIME2,                      -- RXA.3
    cvx_code            VARCHAR(10),                    -- RXA.5.1
    vaccine_name        VARCHAR(200),                   -- RXA.5.2
    dose_amount         DECIMAL(6,2),                   -- RXA.6
    dose_units          VARCHAR(20),                    -- RXA.7.1
    record_source       VARCHAR(5),                     -- RXA.9.1 (00 new, 01 historical)
    administered_npi    VARCHAR(20),                    -- RXA.10.1
    administered_by     VARCHAR(100),                   -- RXA.10.2 + RXA.10.3
    ordering_npi        VARCHAR(20),                    -- ORC.12.1
    lot_number          VARCHAR(50),                    -- RXA.15
    lot_expiration      DATE,                           -- RXA.16
    mvx_code            VARCHAR(10),                    -- RXA.17.1
    manufacturer        VARCHAR(100),                   -- RXA.17.2
    completion_status   VARCHAR(5),                     -- RXA.20 (CP, RE, NA, PA)
    action_code         VARCHAR(5),                     -- RXA.21 (A, U, D)
    route               VARCHAR(50),                    -- RXR.1.2
    site                VARCHAR(50),                    -- RXR.2.2
    vfc_eligibility     VARCHAR(10),                    -- OBX 64994-7 value
    record_status       VARCHAR(20) DEFAULT 'Active',   -- Active / Deleted
    received_at         DATETIME2 DEFAULT SYSDATETIME(),
    updated_at          DATETIME2
);
