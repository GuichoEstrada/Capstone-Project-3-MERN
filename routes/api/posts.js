const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const validatePostInput = require('../../validation/post');

// POSTS
// Create a post
router.post('/', passport.authenticate('jwt', {session: false}), (req,res) => {
	const {errors, isValid} = validatePostInput(req.body);
	if(!isValid) {
		return res.status(400).json(errors);
	}
	const newPost = new Post({
		text: req.body.text,
		name: req.body.name,
		avatar: req.body.avatar,
		user: req.user.id
	});

	newPost.save().then(post => res.json(post));
})

// Show all posts
router.get('/', (req, res) => {
	Post.find()
		.sort({date: -1})
		.then(posts => res.json(posts))
		.catch(err => res.status(404).json({nopostfound: 'No posts found.'}));
})

// Show post by id
router.get('/:id', (req, res) => {
	Post.findById(req.params.id)
		.then(post => res.json(post))
		.catch(err => res.status(404).json({nopostfound: 'No post found with corresponding ID.'}));
});

// LIKES
// Add a like to a post
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
	Profile.findOne({user: req.user.id})
	.then(profile => {
		Post.findById(req.params.id)
		.then(post => {
			if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
				return res.status(400).json({alreadyliked: 'User already liked this post'});
				}
				post.likes.unshift({user: req.user.id});
				post.save().then(post => res.json(post));
			})
			.catch(err => res.status(404).json({postnotfound: 'Post not found'}));
		});
	}
);

// Dislike a post
router.post('/dislike/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
	Profile.findOne({user: req.user.id})
	.then(profile => {
		Post.findById(req.params.id)
		.then(post => {
			if(post.likes.filter(like => like.user.toString() === req.user.id).length = 0) {
				return res.status(400).json({notliked: 'You have not like the post yet.'});
				}
				const removeIndex = post.likes.map(item => item.user.toString())
				.indexOf(req.user.id);
				post.likes.splice(removeIndex, 1);
				post.save().then(post => res.json(post));
			})
			.catch(err => res.status(404).json({postnotfound: 'Post not found'}));
		});
	}
);

// COMMENTS
// Add comments
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
	const {errors, isValid} = validatePostInput(req.body);
	if(!isValid) {
		return res.status(400).json(errors);
	}
	Post.findById(req.params.id)
	.then(post => {
		const newComment = {
			text: req.body.text,
			name: req.body.name,
			avatar: req.body.avatar,
			user: req.user.id
		}
		post.comments.unshift(newComment);
		post.save().then(post => res.json(post))
	})
	.catch(err => res.status(404).json({postnotfound: 'No post found.'}));
});

// DELETION
// Delete user experience
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
	Profile.findOne({user: req.user.id})
	.then(profile => {
		Post.findById(req.params.id)
			.then(post => {
				if(post.user.toString() !== req.user.id) {
					res.status(401).json({notauthorized: 'User not authorized.'});
				}
				post.remove().then(() => res.json({success: true}));
			})
			.catch(err => res.status(404).json({postnotfound: 'Post not found'}));
		});
	});

// Delete posts
router.delete('/post/:post_id', passport.authenticate('jwt', {session: false}), (req, res) => {
	Profile.findOne({user: req.user.id})
	.then(profile => {
		const removeIndex = profile.experience
			.map(item => item.id)
			.indexOf(req.params.exp_id);
		profile.experience.splice(removeIndex, 1);
		profile.save().then(profile => res.json(profile));
	})
	.catch(err => res.status(404).json(err));
});

// Delete a comment
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req, res) => {
	Post.findById(req.params.id)
	.then(post => {
		if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
			return res.status(404).json({commentdoesntexist: 'Comment does not exist'});
		}
		const removeIndex = post.comments.map(item => item._id.toString())
		.indexOf(req.params.comment_id);
		post.comments.splice(removeIndex, 1);
		post.save().then(psot => res.json(post));
	})
	.catch(err => res.status(404).json({nopostfound: 'No post found.'}));
});

module.exports = router;