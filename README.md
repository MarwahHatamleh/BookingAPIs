# BookingAPIs
Booking Back-End APIs

This is a simple project I’m working on booking API.  
It includes basic APIs for handling users, booking , getting a data based on a group by (destinations , date_booking )  using Redis for caching via a Docker , PostgreSQL (Neon).



# ⚙️ 1. Install Redis

- install Docker (recommended)
- install image redis Docker Hub
- run command in Docker CLI 'docker run --name myredis -p 6379:6379 redis'
 >> Redis will start locally on port 6379
- run ping
# should reply: PONG -> you’re connected
-  create file lib/redis.ts

import Redis from "ioredis";

const redis = new Redis({
  host: "localhost", 
  port: 6379,        
});

export default redis;


--------------------------------------------------------------------------------------
import redis in file that you want to use it and set and get data within it

"you can use docker ps to get your redis info (port  , name , localhost)"


