-- Write your migrate up statements here

BEGIN;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    price INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON cars
FOR EACH ROW
WHEN (NEW.brand <> OLD.brand OR NEW.model <> OLD.model OR NEW.price <> OLD.price)
EXECUTE PROCEDURE trigger_set_timestamp();

insert into cars (brand, model, price) values ('Mazda', 'CX-5', 25000), ('Nissan', '350Z', 50000);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    registed TIMESTAMP NOT NULL DEFAULT NOW()
);

insert into users (username, password) values ('vlad', 'vlad');

COMMIT;

---- create above / drop below ----

BEGIN;

drop table ads;
drop table users;

COMMIT;

-- Write your migrate down statements here. If this migration is irreversible
-- Then delete the separator line above.