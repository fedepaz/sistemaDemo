Legacy (MySQL/MariaDB) to Prisma Mapping Guide
This table ensures data integrity and storage optimization for your 200k+ records migration.
Legacy SQL Type Prisma Type Native Attribute (Recommended) TypeScript Type
char(X) String @db.Char(X) string
varchar(X) String @db.VarChar(X) string
text String @db.Text string
decimal(P, S) Decimal @db.Decimal(P, S) Decimal (Prisma)
tinyint Int @db.TinyInt number
smallint Int @db.SmallInt number
int / integer Int (Standard Int) number
bigint BigInt (Standard BigInt) bigint
boolean / tinyint(1) Boolean (Standard Boolean) boolean
datetime DateTime @db.DateTime Date
timestamp DateTime @db.Timestamp(0) Date
date DateTime @db.Date Date
Implementation Examples

1. Exact Precision (Decimal)
   Legacy: costo_p decimal(12,4)
   Prisma: costo_p Decimal @db.Decimal(12, 4)
   Note: Using @db.Decimal(12, 4) prevents MariaDB from defaulting to (65, 30), saving significant storage and index performance.
2. Fixed Length Strings (Char)
   Legacy: codigo char(5)
   Prisma: codigo String @db.Char(5)
   Note: Char is faster for lookups/indexes than VarChar for short, fixed-length codes.
3. Small Integers (TinyInt)
   Legacy: status tinyint
   Prisma: status Int @db.TinyInt
   Note: Maps to a standard number in TypeScript but occupies only 1 byte in the database.
   Migration Best Practice (Data Flow)
   To maintain maximum precision during the "Read" phase from the Legacy DB:
   Legacy Fetch: Keep decimalNumbers: false in your MySQL pool.
   Interface: Use string for all decimal properties.
   Prisma Write: Pass the string directly to the Prisma client. It will automatically convert it to a precise Decimal object without the floating-point rounding errors typical of JavaScript numbers.
