# YoutubeApi

This repository contains a YouTube API project that is designed to render APIs and collect data in MongoDB.

## Features

- **YouTube API Integration**: Fetch data from YouTube's API.
- **Data Storage**: Store fetched data in MongoDB.
- **Rendering**: Render API responses using Render.

## Technologies Used

- **JavaScript**: The main programming language used.
- **Render**: For rendering APIs.
- **MongoDB**: Database for storing collected data.

## Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/Yoraver/YoutubeApi.git
    cd YoutubeApi
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    - Create a `.env` file in the root directory.
    - Add your MongoDB connection string and YouTube API key:
      ```env
      MONGODB_URI=your_mongodb_connection_string
      YOUTUBE_API_KEY=your_youtube_api_key
      ```

## Usage

1. **Start the application**:
    ```sh
    npm start
    ```

2. **Access the API**:
    - The API will be available at `http://localhost:3000`.

## API Endpoints

- **GET /api/videos**: Fetch a list of videos.
- **GET /api/videos/:id**: Fetch a specific video by ID.
- **POST /api/videos**: Add a new video.
- **DELETE /api/videos/:id**: Delete a video by ID.

## Contributing

1. **Fork the repository**.
2. **Create a new branch**:
    ```sh
    git checkout -b feature-branch
    ```
3. **Make your changes**.
4. **Commit your changes**:
    ```sh
    git commit -m "Description of changes"
    ```
5. **Push to the branch**:
    ```sh
    git push origin feature-branch
    ```
6. **Create a Pull Request**.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, please contact [Yoraver](https://github.com/Yoraver).
