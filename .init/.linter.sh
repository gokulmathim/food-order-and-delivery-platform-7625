#!/bin/bash
cd /home/kavia/workspace/code-generation/food-order-and-delivery-platform-7625/food_ordering_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

