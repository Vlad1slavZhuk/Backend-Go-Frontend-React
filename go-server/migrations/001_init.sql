-- Write your migrate up statements here

BEGIN;

CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    price INTEGER DEFAULT 0 NOT NULL
);

insert into cars (brand, model, price) values ('Mazda', 'CX-5', 25000), ('Nissan', '350Z', 50000);

COMMIT;

---- create above / drop below ----

BEGIN;

drop table ads;

COMMIT;

-- Write your migrate down statements here. If this migration is irreversible
-- Then delete the separator line above.