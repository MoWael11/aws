#!/bin/bash
cd "$CODEBUILD_SRC_DIR" || exit
npm run install:all
