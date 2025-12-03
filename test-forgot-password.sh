#!/bin/bash

echo "Testing Forgot Password Endpoint"
echo "================================="
echo ""

# Test with an email that should exist in the database
echo "1. Testing with existing user (john.doe@example.com):"
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "akashthanda14@gmail.com"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo ""

# Test with the email from .env (admin email for testing)
echo "2. Testing with admin email (akashthanda14@gmail.com):"
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "akashthanda14@gmail.com"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo ""

# Test with a non-existent email
echo "3. Testing with non-existent email (should still return success for security):"
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Check the server terminal for detailed logs!"
