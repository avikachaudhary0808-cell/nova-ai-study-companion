import jwt from 'jsonwebtoken'

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(401)
    return next(new Error('Not authorized, no token'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401)
    return next(new Error('Not authorized, token failed'))
  }
}

export default protect
