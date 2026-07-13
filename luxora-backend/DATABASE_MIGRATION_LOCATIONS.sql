-- Create States Table
CREATE TABLE IF NOT EXISTS states (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(2) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Cities Table
CREATE TABLE IF NOT EXISTS cities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  state_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
  UNIQUE KEY unique_city_state (name, state_id),
  INDEX idx_state_id (state_id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert States
INSERT INTO states (name, code) VALUES
('Andhra Pradesh', 'AP'),
('Arunachal Pradesh', 'AR'),
('Assam', 'AS'),
('Bihar', 'BR'),
('Chhattisgarh', 'CT'),
('Goa', 'GA'),
('Gujarat', 'GJ'),
('Haryana', 'HR'),
('Himachal Pradesh', 'HP'),
('Jharkhand', 'JH'),
('Karnataka', 'KA'),
('Kerala', 'KL'),
('Madhya Pradesh', 'MP'),
('Maharashtra', 'MH'),
('Manipur', 'MN'),
('Meghalaya', 'ML'),
('Mizoram', 'MZ'),
('Nagaland', 'NL'),
('Odisha', 'OD'),
('Punjab', 'PB'),
('Rajasthan', 'RJ'),
('Sikkim', 'SK'),
('Tamil Nadu', 'TN'),
('Telangana', 'TG'),
('Tripura', 'TR'),
('Uttar Pradesh', 'UP'),
('Uttarakhand', 'UK'),
('West Bengal', 'WB'),
('Andaman and Nicobar Islands', 'AN'),
('Chandigarh', 'CH'),
('Dadra and Nagar Haveli and Daman and Diu', 'DN'),
('Lakshadweep', 'LD'),
('Delhi', 'DL'),
('Puducherry', 'PY'),
('Ladakh', 'LA'),
('Jammu and Kashmir', 'JK');

-- Insert Cities for Maharashtra
INSERT INTO cities (name, state_id) VALUES
('Mumbai', (SELECT id FROM states WHERE code = 'MH')),
('Pune', (SELECT id FROM states WHERE code = 'MH')),
('Nagpur', (SELECT id FROM states WHERE code = 'MH')),
('Thane', (SELECT id FROM states WHERE code = 'MH')),
('Aurangabad', (SELECT id FROM states WHERE code = 'MH')),
('Nashik', (SELECT id FROM states WHERE code = 'MH')),
('Kolhapur', (SELECT id FROM states WHERE code = 'MH'));

-- Insert Cities for Delhi
INSERT INTO cities (name, state_id) VALUES
('New Delhi', (SELECT id FROM states WHERE code = 'DL')),
('Delhi', (SELECT id FROM states WHERE code = 'DL')),
('East Delhi', (SELECT id FROM states WHERE code = 'DL')),
('North Delhi', (SELECT id FROM states WHERE code = 'DL')),
('South Delhi', (SELECT id FROM states WHERE code = 'DL')),
('West Delhi', (SELECT id FROM states WHERE code = 'DL'));

-- Insert Cities for Karnataka
INSERT INTO cities (name, state_id) VALUES
('Bangalore', (SELECT id FROM states WHERE code = 'KA')),
('Mysore', (SELECT id FROM states WHERE code = 'KA')),
('Mangalore', (SELECT id FROM states WHERE code = 'KA')),
('Hubballi', (SELECT id FROM states WHERE code = 'KA')),
('Bellary', (SELECT id FROM states WHERE code = 'KA')),
('Davangere', (SELECT id FROM states WHERE code = 'KA'));

-- Insert Cities for Tamil Nadu
INSERT INTO cities (name, state_id) VALUES
('Chennai', (SELECT id FROM states WHERE code = 'TN')),
('Coimbatore', (SELECT id FROM states WHERE code = 'TN')),
('Madurai', (SELECT id FROM states WHERE code = 'TN')),
('Salem', (SELECT id FROM states WHERE code = 'TN')),
('Tirunelveli', (SELECT id FROM states WHERE code = 'TN')),
('Erode', (SELECT id FROM states WHERE code = 'TN'));

-- Insert Cities for Gujarat
INSERT INTO cities (name, state_id) VALUES
('Ahmedabad', (SELECT id FROM states WHERE code = 'GJ')),
('Surat', (SELECT id FROM states WHERE code = 'GJ')),
('Vadodara', (SELECT id FROM states WHERE code = 'GJ')),
('Rajkot', (SELECT id FROM states WHERE code = 'GJ')),
('Jamnagar', (SELECT id FROM states WHERE code = 'GJ')),
('Bhavnagar', (SELECT id FROM states WHERE code = 'GJ')),
('Gandhinagar', (SELECT id FROM states WHERE code = 'GJ'));

-- Insert Cities for Uttar Pradesh
INSERT INTO cities (name, state_id) VALUES
('Lucknow', (SELECT id FROM states WHERE code = 'UP')),
('Kanpur', (SELECT id FROM states WHERE code = 'UP')),
('Ghaziabad', (SELECT id FROM states WHERE code = 'UP')),
('Agra', (SELECT id FROM states WHERE code = 'UP')),
('Meerut', (SELECT id FROM states WHERE code = 'UP')),
('Varanasi', (SELECT id FROM states WHERE code = 'UP')),
('Allahabad', (SELECT id FROM states WHERE code = 'UP'));

-- Insert Cities for Rajasthan
INSERT INTO cities (name, state_id) VALUES
('Jaipur', (SELECT id FROM states WHERE code = 'RJ')),
('Jodhpur', (SELECT id FROM states WHERE code = 'RJ')),
('Ajmer', (SELECT id FROM states WHERE code = 'RJ')),
('Udaipur', (SELECT id FROM states WHERE code = 'RJ')),
('Kota', (SELECT id FROM states WHERE code = 'RJ')),
('Bikaner', (SELECT id FROM states WHERE code = 'RJ'));

-- Insert Cities for West Bengal
INSERT INTO cities (name, state_id) VALUES
('Kolkata', (SELECT id FROM states WHERE code = 'WB')),
('Howrah', (SELECT id FROM states WHERE code = 'WB')),
('Durgapur', (SELECT id FROM states WHERE code = 'WB')),
('Siliguri', (SELECT id FROM states WHERE code = 'WB')),
('Darjeeling', (SELECT id FROM states WHERE code = 'WB'));

-- Verify tables
SELECT 'States Table' as Table_Name, COUNT(*) as Count FROM states
UNION
SELECT 'Cities Table', COUNT(*) FROM cities;
