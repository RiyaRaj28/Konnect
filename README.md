<a name="readme-top"></a>


<!-- PROJECT LOGO -->
<br />
<div align="center">
<!--     <img src="https://media.discordapp.net/attachments/794519160746541108/1061560277168029756/valky.png" alt="Logo" width="80" height="80"> -->
  </a>

  <h3 align="center" >Konnect - A Modern Day Logistics Platform</h3>
<hr/>
<hr/>

</div>

<br>
<br>
<br>



<!-- ABOUT THE PROJECT -->
## About The Project 
![image](https://github.com/user-attachments/assets/0dbb4bbc-cd82-484f-a563-0a2f130ff784)
![image](https://github.com/user-attachments/assets/24605a7b-8349-42d9-94ed-264493e179b2)
![image](https://github.com/user-attachments/assets/d8f7f7a4-dd5b-4d8f-b11d-3831c0f50d11)
![image](https://github.com/user-attachments/assets/4af96e86-008d-46e2-9fee-e10d0fc7350c)
![image](https://github.com/user-attachments/assets/603f6b48-5c85-4299-96cb-14a9aed410c9)
![image](https://github.com/user-attachments/assets/d9cb8a06-d0a3-4aba-8443-0251d92ac5e7)
![image](https://github.com/user-attachments/assets/742d6aca-5ebd-40f2-9668-b7384573dccd)
![image](https://github.com/user-attachments/assets/563b00c9-e980-44d7-8a6f-fabc26df6ff8)
![image](https://github.com/user-attachments/assets/e8374bee-05b3-4982-b967-0c88606b13c0)
![image](https://github.com/user-attachments/assets/e4323708-149e-41c2-8188-0b7dae3f65c6)
![image](https://github.com/user-attachments/assets/e14d0283-6818-4985-af26-b47a72f0f9a9)

# Logistics Platform - Overview
This logistics platform is designed for connecting clients to vehicle drivers using a microservices architecture, focusing on modular, scalable, and efficient systems for real-time tracking, booking, and driver management.

## Key Features
1. Microservices Architecture
Independent Services: Booking, driver management, and real-time tracking are separated, allowing for independent scaling and maintenance.
Trade-offs: Easier scalability but added complexity in communication and data consistency handled via REST APIs and message queues.

3. Real-time Updates with WebSockets
WebSockets (Socket.io): Used for low-latency real-time driver location updates.
Challenges: Handling scalability of concurrent WebSocket connections.

5. Asynchronous Job Processing
BullMQ: Used for async job handling (e.g., driver assignment), improving responsiveness.
Retries & Error Handling: Built-in support for retries and task prioritization.

7. Caching & Data Management
Redis: For caching driver data, improving read performance and reducing database load.
Cron Job: Driver ratings are updated daily via a scheduled cron job to ensure rating accuracy.

9. Scalability & Traffic Management
Database Optimization: Indexed fields and MongoDB geospatial queries for efficient nearest-driver searches.
Rate Limiting: Prevents abuse by limiting API requests.
Stateless Backend: Backend is stateless, allowing easy horizontal scaling.

10. Surge Price Tracking
Price tracking based on the distance between the two coordinates.

12. Future Scalability
Kubernetes: Planned for container orchestration, enabling auto-scaling and self-healing services.
Multi-region Deployment: Support for global multi-region deployment, reducing latency and improving fault tolerance.




<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Technologies Used

### Frontend

- **React**: Used for building the user interface.
- **React Router**: For client-side routing.
- **Leaflet & React-Leaflet**: Used for mapping and location-based services.
- **Axios**: For making HTTP requests.

### Backend

- **Node.js & Express**: Backend framework for handling requests and routing.
- **MongoDB & Mongoose**: Database and ORM for storing and managing data.
- **JWT (jsonwebtoken)**: For handling user authentication and security.
- **Zod**: For schema validation.
- **Bcryptjs**: For hashing passwords.
- **Cronjon**: For updating driver ratings every 24 hours.
- **Bullmq**: For assigning drivers through a queue system.
- **Redis**: For caching of driver and current session data.

## Installation

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your system.


### Steps

1. **Fork the Repository**

2. **Clone the Repository**:
   ```bash
   git clone ${url_of_your_forked_repo}
   cd logistics-platform
   ```

3. **Setup the Client**:

    ```bash
    cd frontend
    npm install
    ```
  
  
4. **Setup the Server**:
    ```bash
    cd ../backend
    npm install
    ```



5. **Create a `.env` File**:

   - In the `backend` directories, create a `.env` file and add the necessary environment variables.

   - **Example for `server/.env`**:
     ```plaintext
     MONGO_URI=your_mongodb_uri
     JWT_SECRET_KEY=your_jwt_secret_key
     GOOGLE_API_KEY=your_google_api_key
     SESSION_SECRET=your_secret
     ```

## Run the Application

1. **Start the backend**

    ```bash
    cd backend
    npm run dev
    ```
2. **Start the frontend**

    ```bash
    cd ../frontend
    npm run start
   ```

## Access the application

- Open your browser and go to http://localhost:3000 to view the application.


<p align="right">(<a href="#readme-top">back to top</a>)</p>
