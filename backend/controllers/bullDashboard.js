const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const express = require('express');

const { driverQueue } = require('../services/PostBookingActionsQueue'); // Adjust the path as needed
console.log(driverQueue);


function setupBullDashboard(app) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [new BullAdapter(driverQueue)],
    serverAdapter: serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  console.log('Bull Dashboard set up at /admin/queues');
}

module.exports = setupBullDashboard;