import JWT from 'jsonwebtoken';

export const verifyToken = (token) => {
    return JWT.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return false;
        } else {
            return decoded;
        }
    });
};