#!/bin/bash

pm2 start server.js --name cc;
pm2 logs;