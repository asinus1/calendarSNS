'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Event = require('../models/event');
const User = require('../models/user');
const Eventfollow = require('../models/eventfollow');
const moment = require('moment-timezone');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const request = require('request');
const cheerio = require('cheerio');

router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('new', { user: req.user, csrfToken: req.csrfToken() });
});

router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const eventId = uuid.v4();
  const updatedAt = new Date();
  const eventTime = new Date(req.body.eventtime);
  let eventTitle = '';
  request(req.body.eventurl, (err, res2, body) => {
    if (err) {
      console.error(err);
    } else {
      const myHtml = cheerio.load(body);
      eventTitle = myHtml('title').text();
      Event.create({
        eventId: eventId,
        eventName: eventTitle.slice(0,255) || '名称未設定',
        eventPlace: '場所未設定',
        eventTime: eventTime,
        eventUrl: req.body.eventurl,
        eventDesc: '未設定',
        createdBy: req.user.id,
        createdByName: req.user.username,
        updatedAt: updatedAt
      }).then(() => {
        Eventfollow.create({
          follow: req.user.id,
          eventfollowed: eventId,
          followname: req.user.username
        }).then(() => {
          res.redirect('/events/' + eventId);
        })
      });
    }
  });
  /*
  console.log(eventTitle);
  Event.create({
    eventId: eventId,
    eventName: eventTitle.slice(0,255) || '名称未設定',
    eventPlace: req.body.eventplace.slice(0,255) || '場所未設定',
    eventTime: eventTime,
    eventUrl: req.body.eventurl,
    eventDesc: req.body.eventdesc,
    createdBy: req.user.id,
    createdByName: req.user.username,
    updatedAt: updatedAt
  }).then(() => {
    Eventfollow.create({
      follow: req.user.id,
      eventfollowed: eventId,
      followname: req.user.username
    }).then(() => {
      res.redirect('/events/' + eventId);
    })
  });
  */
});

router.get('/:eventId', (req, res, next) => {
  Event.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }
    ],
    where: {
      eventId: req.params.eventId
    },
    order: [['eventTime', 'ASC']]
  }).then((event) => {
    if (event) {
      Eventfollow.findAll({
        where: {
          eventfollowed: req.params.eventId
        }
      }).then((eventfollowers) => {
        let isFollowed = 0;
        eventfollowers.some((ef) => {
          if (ef.follow === req.user.id) {
            isFollowed = 1;
            return true;
          }
        });
        event.formattedEventTime = moment(event.eventTime).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
        res.render('event', {
          user: req.user,
          isFollowed: isFollowed,
          event: event,
          eventfollowers: eventfollowers
        });
      })
    } else {
      const err = new Error('指定されたイベントは見つかりませんでした');
      err.status = 404;
      next(err);
    }
  });
});

router.post('/:eventId/follow/:userId', authenticationEnsurer, (req, res, next) => {
  const userId = req.params.userId;
  const eventId = req.params.eventId;
  let isFollowed = req.body.isFollowed;
  isFollowed = isFollowed ? parseInt(isFollowed) : 0;
  User.findOne({
    where: {
      userId: userId
    }
  }).then((user) => {
    Eventfollow.upsert({
      follow: userId,
      eventfollowed: eventId,
      followname: user.username
    }).then(() => {
      res.json({ status: 'OK', isFollowed: isFollowed });
    });
  });
});

router.post('/:eventId/unfollow/:userId', authenticationEnsurer, (req, res, next) => {
  const userId = req.params.userId;
  const eventId = req.params.eventId;
  let isFollowed = req.body.isFollowed;
  isFollowed = isFollowed ? parseInt(isFollowed) : 0;
  Eventfollow.destroy({
    where: {
      follow: userId,
      eventfollowed: eventId
    }
  }).then(() => {
    res.json({ status: 'OK', isFollowed: isFollowed});
  });
});

module.exports = router;