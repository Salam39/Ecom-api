import JWT from 'jsonwebtoken';

const generateToken = (id) => {
    return JWT.sign({ id }, process.env.JWT_KEY, { expiresIn: "3d" });
};

export default generateToken;
