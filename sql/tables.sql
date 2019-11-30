CREATE TABLE cards (
    id_card SERIAL PRIMARY KEY,
    nm_card VARCHAR,
    nm_attribute VARCHAR,
    ds_url_card VARCHAR
);

CREATE TABLE cards_price (
    id_card INTEGER,
    dt_reference INTEGER,
    id_site INTEGER,
    vl_price NUMERIC(8, 2),
    ds_url VARCHAR,
    CONSTRAINT cards_price_fkey FOREIGN KEY (id_card) REFERENCES cards(id_card),
    CONSTRAINT cards_price_pkey PRIMARY KEY (id_card, dt_reference, id_site)
);