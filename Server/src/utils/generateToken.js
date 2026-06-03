import jwt from 'jsonwebtoken';

//gernarting token for secure communtication - sent back with every req from client
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d", //token expiration
    }
  );
};

export default generateToken;