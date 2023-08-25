# Surtrics

## Introduction
*Why the new name?*

This project was supposed to be an addition to surport. But they have wildly different data models.
Surport is a large collection of data that mutates over time and is not easily represented in a relational database.

Surtrics is a large collection of similar data that is easily represented in a relational database. The proposed
functionalities also lend themselves to this approach as well as this app is most succinctly described as a collection
of views.

## Data Model
The data exported by SkuVault is a collection of objects that easily lend themselves to being
stored long term in a table.

## Table Structure
The table structure is as follows:

* Table Name : Surtrics
* Columns:
    * user : varchar(255)
    * sku : varchar(255)
    * code : varchar(255)
    * scanned_code : varchar(255)
    * lot_number: varchar(255)
    * title : varchar(255)
    * quantity : int
    * quantity_before: int
    * quantity_after: int
    * location: varchar(255)
    * serial_numbers : varchar(255)
    * transaction_type: varchar(255)
    * transaction_reason: varchar(255)
    * transaction_note: varchar(255)
    * transaction_date : datetime
    * context : varchar(255)

```sql
-- Table: surtrics.surplus_metrics_data

-- DROP TABLE IF EXISTS surtrics.surplus_metrics_data;

CREATE TABLE IF NOT EXISTS surtrics.surplus_metrics_data
(
    id bigint NOT NULL DEFAULT nextval('surtrics.surplus_metrics_data_id_seq'::regclass),
    "user" character varying COLLATE pg_catalog."default" NOT NULL,
    sku character varying COLLATE pg_catalog."default",
    code character varying COLLATE pg_catalog."default",
    scanned_code character varying COLLATE pg_catalog."default",
    lot_number character varying COLLATE pg_catalog."default",
    title character varying COLLATE pg_catalog."default",
    quantity integer,
    quantity_before integer,
    quantity_after integer,
    location character varying COLLATE pg_catalog."default",
    serial_numbers character varying COLLATE pg_catalog."default",
    transaction_type character varying COLLATE pg_catalog."default",
    transaction_reason character varying COLLATE pg_catalog."default",
    transaction_note character varying COLLATE pg_catalog."default",
    transaction_date character varying COLLATE pg_catalog."default",
    context character varying COLLATE pg_catalog."default",
    CONSTRAINT surplus_metrics_data_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS surtrics.surplus_metrics_data
    OWNER to apiinsync;
```

## Project Overview
This project would consist of views built from the data in the table.
These views could be split into two categories:
1) admin
2) user

The project would have three main systems.

1) Front End UI
2) Back End API
3) Database

## Initial Views
###  Weekly
This view is going to be a bar graph the shows weekly progress for the whole team.

### Daily
This view is going to show daily progress for the whole team.
One proposed features for this view is that is calculates missed goals for the week
and adds them to the rest of the days evenly.

### Individual
This view is going to show the progress of an individual user.
Some proposed features for this view are:
show templates approved ( maybe I can get this from the crawler db).
AVG per hour
VS last week (so you can see how you are trending vs last week)
(for fun extra) Gold Bar that shows all-time best week, and whenever someone beats it, they get a gold bar.

## Future Views
Views that are not currently planned but could be added in the future:
An admin 1:1 view that shows the progress of an individual user over time.
An admin view of how far they are from their daily, weekly, monthly goals etc.
A view that shows the progress of a team over time.
Really, anything that involves the data in the table can be added as a view.

## Notes
Update Rate:
I think this needs to be a setting that can be changed by an admin.
E.G 1 minute, 5 minutes, 10 minutes, 30 minutes, 1 hour, 1 day, 1 week, 1 month.


## Tech for Initial build
### Front End
* React
* Next.js
* Chart.js
* Bootstrap

### Back End
* Node.js
* Next.js

### Database
* Postgres


