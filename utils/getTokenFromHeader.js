export const getTokenFromHeader = (req) => {
    // get token from header (inside Postman)
    const token = req?.headers?.authorization?.split(" ")[1];
    if (token === undefined) {
        return "No token Found in Header";
    } else {
        return token;
    }

}