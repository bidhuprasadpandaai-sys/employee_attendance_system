import Employee from '../models/Employee.js';
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authorization token missing or invalid' });
            return;
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = Buffer.from(token, 'base64').toString('ascii');
        }
        catch (err) {
            res.status(401).json({ message: 'Malformed authorization token' });
            return;
        }
        const [userId, role] = decoded.split(':');
        if (!userId || !role) {
            res.status(401).json({ message: 'Invalid session token payload' });
            return;
        }
        // Optional: Verify user still exists in DB
        const userExists = await Employee.exists({ _id: userId });
        if (!userExists) {
            res.status(401).json({ message: 'Session owner does not exist' });
            return;
        }
        req.user = {
            id: userId,
            role: role
        };
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Internal auth middleware error', error: error.message });
    }
};
export const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied: Administrative privileges required' });
        return;
    }
    next();
};
