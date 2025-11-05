#!/bin/bash

echo "=== Current Component Structure ==="
echo ""
echo "Actions/Reactions:"
find src/lib/registry/components -type f -path "*/reaction/*" -o -path "*/zap*/*" | sort

echo ""
echo "User Components:"
find src/lib/registry/components -type f -path "*/user-*/*" | head -20

echo ""
echo "Article Components:"
find src/lib/registry/components -type f -path "*/article*/*" | head -20

echo ""
echo "Event Components:"
find src/lib/registry/components -type f -path "*/event*/*" | head -20
