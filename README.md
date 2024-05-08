[![screenshot from the platform](https://github.com/ListowelAdolwin/video-platform/blob/dev/client/src/assets/sc1.png)](https://video-platform.onrender.com/)
# Video Platform

Welcome to the Video Platform project! This platform was developed for video creators to upload videos to be consumed by video lovers. This README serves as a guide to understand the features and functionalities of the Platform.<br/>
Click below to see a live demo of the the project <br/>
[Video Platform](https://video-platform.onrender.com/)

## User Requirements

### Users

- **Signup & Login:** Users can create an account using their email and password, with account verification for security. Additionally, there's a reset password feature for recovering lost passwords.
- **Navigation:** Users can easily navigate through various video pages with ```next``` and ```prev``` buttons.
- **Sharing:** Users have the ability to share links to video pages.

### Creators

- **Video Management:** Creators can upload videos along with titles and descriptions.

- **Video Controls:** Common control buttons are provided for users to manage video playback.
- **Sharing:** A share button allows users to easily share the link to the current video page.

## Technologies Used

- **Backend:** Node.js, Express.js, Json Web Tokens.
- **Frontend:** React.js, Tailwind CSS, Redux, Redux-Persist.
- **Database:** MongoDB.
- **Testing:** Jest and Supertest
- **Video Storage:** Videos are uploaded to firebase and their urls stored in the database.


## Getting Started

To get started with the Video Platform, follow these steps:

1. Clone the repository to your local machine.
2. Install dependencies using `npm install`.
3. Configure environment variables for backend and frontend.
4. Run the backend server using `npm run dev`.
5. Run the frontend application using `npm run dev`.

## Testing
1. Navigate to `api/`
2. Run `npm test` to execute test files for authentication and video controllers

## Contributing

Contributions to the Video Platform are welcome! If you have any ideas for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as per the terms of the license.
