import { google } from 'googleapis';
import User from '../models/user.js';
import { generateToken, setJwtCookie } from '../utils/jwtTemplate.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_DEV
  // process.env.GOOGLE_REDIRECT_PROD
);

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const authorizationUrl = (request, h) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // eslint-disable-line camelcase
    scope: scopes,
    include_granted_scopes: true, // eslint-disable-line camelcase
  });
  return h.redirect(url);
};

const googleCallback = async (request, h) => {
  const { code } = request.query;

  if (!code) {
    return h.response({ err: 'Authorization code not found' }).code(400);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    if (!data) {
      return h
        .response({ err: 'Failed to get user data from Google' })
        .code(400);
    }

    let user = await User.findOne({ email: data.email });
    let profilePictureBuffer = null;
    let profilePictureMimeType = null;

    if (!user) {
      if (data.picture) {
        try {
          const response = await axios(data.picture, {
            responseType: 'arraybuffer',
          });
          profilePictureBuffer = Buffer.from(response.data);
          profilePictureMimeType = response.headers['content-type'];
        } catch (err) {
          console.error('Failed to fetch Google profile picture:', err);
        }
      }

      // Lalu pas create user:
      user = await User.create({
        name: data.name,
        email: data.email,
        role: 'user',
        profilePictureData: profilePictureBuffer,
        profilePictureMimeType: profilePictureMimeType,
        age: data.age || null,
        height: data.height || null,
        weight: data.weight || null,
        isVerified: true,
      });

      // Create new user with default role 'user'
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    setJwtCookie(h, token);

    const responseObject = {
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          profilePictureMimeType: user.profilePictureMimeType,
          age: user.age,
          height: user.height,
          weight: user.weight,
          isVerified: user.isVerified,
        },
      },
    };

    console.log('📦 JSON Response:');
    console.log(JSON.stringify(responseObject, null, 2)); // tampil rapi di console
    console.log({ token: token });

    return h.response(responseObject).code(200);
  } catch (error) {
    console.error('Google callback error:', error);
    return h.response({ err: 'Authentication failed' }).code(500);
  }
};

export { googleCallback, authorizationUrl };
