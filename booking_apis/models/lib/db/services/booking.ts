import pool from "..";
import redisClient from "@/models/lib/db/redis";

/*
CREATE TABLE booking(
   id SERIAL PRIMARY KEY NOT NULL,
   username VARCHAR(225),
   room_id INTEGER NOT NULL,
  guest_number INTEGER NOT NULL,
  traveling_with_pets BOOLEAN DEFAULT false,
   country VARCHAR(225) NOT NULL,
  destination VARCHAR(225) ,
  booking_date DATE NOT NULL,
  end_booking DATE NOT NULL,
   phoneNumber INTEGER NOT NULL  ,
   email VARCHAR(225) NOT NULL  ,
   user_id INTEGER,
   FOREIGN KEY (user_id) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(room_id , booking_date)
)
*/

export type bookTrip = {
  username: string;
  room_id: number;
  guest_number: number;
  traveling_with_pets: boolean;
  country: string;
  destination: string;
  booking_date: Date;
  end_booking: Date;
  phoneNumber: number;
  email: string;
  user_id: number;
};

// ON CONFLICT (room_id , booking_date) DO NOTHING >> using this way my app will be booking per day

export const bookTrip = async (book: bookTrip) => {
  const result = await pool.query(
    `INSERT INTO booking (
      username,
      room_id,
      guest_number,
      traveling_with_pets,
      country,
      destination,
      booking_date,
      end_booking,
      phoneNumber,
      email,
      user_id
    )
    SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    WHERE NOT EXISTS (
      SELECT 1
      FROM booking b
      WHERE 
        b.room_id = $2
        AND (
          b.booking_date, b.end_booking
        ) OVERLAPS ($7::date, $8::date)
    )
    RETURNING *;`,
    [
      book.username,
      book.room_id,
      book.guest_number,
      book.traveling_with_pets,
      book.country,
      book.destination,
      book.booking_date,
      book.end_booking,
      book.phoneNumber,
      book.email.toLowerCase(),
      book.user_id,
    ]
  );

  if (result.rows.length === 0) {
    return { message: "Room already booked for that date range." };
  }

  await redisClient.set(
    `booking:${result.rows[0].id}`,
    JSON.stringify({
      id: result.rows[0].id,
      username: result.rows[0].username,
      room_id: result.rows[0].room_id,
      guest_number: result.rows[0].guest_number,
      country: result.rows[0].country,
      destination: result.rows[0].destination,
      traveling_with_pets: result.rows[0].traveling_with_pets,
      booking_date: result.rows[0].booking_date,
      end_booking: result.rows[0].end_booking,
      phoneNumber: result.rows[0].phoneNumber,
      email: result.rows[0].email,
    })
  );
  return result.rows[0];
};

export const DeleteBooking = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM booking WHERE id = $1 RETURNING *",
    [id]
  );
  await redisClient.del(`booking:${id}`);
  return result.rows;
};

export const GetBookingGroupingByDesAndDate = async () => {
  const result = await pool.query(
    "SELECT destination , booking_date , ARRAY_AGG(username) from booking GROUP BY destination , booking_date ORDER BY booking_date"
  );
  return result.rows;
};

export const GetCountBookingByDes = async () => {
  const result = await pool.query(
    "SELECT destination , Count(*) from booking GROUP BY destination"
  );
  return result.rows;
};


export const GetBooksById = async (user_id : number , id : number) => {
  const result = await pool.query(
    "SELECT * from booking WHERE user_id = $1 AND id = $2",[user_id , id]
  );
const redisData = await redisClient.get(`booking:${id}`);
//console.log(redisData);
  return JSON.parse(redisData!);
};
