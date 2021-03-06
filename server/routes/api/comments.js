import express from 'express';
import Comments from '../../controllers/comments';
import checkToken from '../../middlewares/checkToken';
import validate from '../../middlewares/validations';
import schema from '../../middlewares/validations/comments.schema';

const router = express.Router();

router.post('/articles/:slug/comments', checkToken, validate(schema.comment), Comments.create);
router.get('/articles/:slug/comments', Comments.getAll);
router.delete('/articles/:slug/comments/:id', checkToken, validate(schema.idParam, true), Comments.delete);
router.put('/articles/:slug/comments/:id', checkToken, validate(schema.idParam, true), validate(schema.comment), Comments.update);
router.post('/articles/:slug/comments/:id/favorite', checkToken, Comments.like);
router.delete('/articles/:slug/comments/:id/favorite', checkToken, Comments.unLike);

export default router;
