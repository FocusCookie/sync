module.exports = function(req, res, next) {
	// this middleware needs to implemented after the auth middleware
	if (!req.user.isAdmin) {
		return res.status(403).send("Access denied.");
	} else {
		next();
	}
};
