import express, { Request, Response } from 'express';

import { validateAdminToken, validateToken } from '../middleware/validation';
import { Comment } from '../models/comment.model';
import { User } from '../models/user.model';

const router = express.Router();

// create a new comment
router.post('/', validateToken, async (req: Request, res: Response) => {
  try {
    const id = req.user?.id ?? '0';
    const { comment, classRoutineId } = req.body;

    // Check for missing fields
    if (!comment || !classRoutineId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new comment
    await Comment.create({ comment, classRoutineId, studentId: id });

    // Send response with comment data
    res.status(201).json({ data: true });
  } catch (error) {
    console.error('Error creating comment: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const comments = await Comment.findAll({
      attributes: {
        exclude: ['studentId']
      },
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    res.json({ data: comments });
  } catch (error) {
    console.error('Error fetching comments: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// delete through id
router.delete('/:id', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if comment exists
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Delete comment
    await comment.destroy();

    // Send response
    res.status(200).json({ data: true });
  } catch (error) {
    console.error('Error removing comment: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
