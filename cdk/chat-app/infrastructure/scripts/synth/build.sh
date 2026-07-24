#!/bin/bash
cd "$CODEBUILD_SRC_DIR" || exit
cd frontend && npm run build && cd -
cd infrastructure && npm run build && cd ..
