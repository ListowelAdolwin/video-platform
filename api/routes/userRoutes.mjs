import express from 'express'
import { getUsers } from '../controllers/userControllers.mjs'
import { verifyToken } from '../controllers/authControllers.mjs'

const router = express.Router()

router.get('/', verifyToken, getUsers)

export default router