#!/bin/bash

echo "========================================="
echo "Image Upload Test Script"
echo "========================================="
echo ""

# Configuration
BASE_URL="http://localhost:3000"
EMAIL="john.doe@example.com"
PASSWORD="temp_password"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login to get token
echo -e "${YELLOW}Step 1: Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"
echo ""

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed! Could not get token${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login successful!${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Create a test image (1x1 pixel PNG)
echo -e "${YELLOW}Step 2: Creating test image...${NC}"
TEST_IMAGE="test-upload-image.png"

# Create a simple 1x1 pixel PNG file
printf '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0d\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90\x77\x53\xde\x00\x00\x00\x0c\x49\x44\x41\x54\x08\xd7\x63\xf8\xcf\xc0\x00\x00\x03\x01\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00\x49\x45\x4e\x44\xae\x42\x60\x82' > $TEST_IMAGE

echo -e "${GREEN}✅ Test image created: $TEST_IMAGE${NC}"
echo ""

# Step 3: Test Local Upload (Single File)
echo -e "${YELLOW}Step 3: Testing local single file upload...${NC}"
echo "Endpoint: POST $BASE_URL/upload/local"
echo "Field name: image"
echo ""

UPLOAD_RESPONSE=$(curl -s -X POST $BASE_URL/upload/local \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@$TEST_IMAGE")

echo "Response:"
echo "$UPLOAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Local upload successful!${NC}"
else
    echo -e "${RED}❌ Local upload failed!${NC}"
fi
echo ""

# Step 4: Test Cloudinary Upload (Single File)
echo -e "${YELLOW}Step 4: Testing Cloudinary single file upload...${NC}"
echo "Endpoint: POST $BASE_URL/upload/cloudinary"
echo "Field name: image"
echo ""

CLOUDINARY_RESPONSE=$(curl -s -X POST $BASE_URL/upload/cloudinary \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@$TEST_IMAGE")

echo "Response:"
echo "$CLOUDINARY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CLOUDINARY_RESPONSE"
echo ""

if echo "$CLOUDINARY_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Cloudinary upload successful!${NC}"
    
    # Extract URL if available
    URL=$(echo "$CLOUDINARY_RESPONSE" | grep -o '"url":"[^"]*' | cut -d'"' -f4 | head -1)
    if [ ! -z "$URL" ]; then
        echo -e "${GREEN}Image URL: $URL${NC}"
    fi
else
    echo -e "${RED}❌ Cloudinary upload failed!${NC}"
fi
echo ""

# Step 5: Test Wrong Field Name (should fail)
echo -e "${YELLOW}Step 5: Testing with WRONG field name (should fail)...${NC}"
echo "Field name: file (incorrect)"
echo ""

WRONG_RESPONSE=$(curl -s -X POST $BASE_URL/upload/local \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_IMAGE")

echo "Response:"
echo "$WRONG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$WRONG_RESPONSE"
echo ""

if echo "$WRONG_RESPONSE" | grep -q '"success":false'; then
    echo -e "${GREEN}✅ Correctly rejected wrong field name!${NC}"
else
    echo -e "${RED}❌ Should have rejected wrong field name${NC}"
fi
echo ""

# Cleanup
echo -e "${YELLOW}Cleaning up test image...${NC}"
rm -f $TEST_IMAGE
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

echo "========================================="
echo "Test Complete!"
echo "========================================="
echo ""
echo "Summary:"
echo "  - Field name for single upload: 'image'"
echo "  - Field name for multiple upload: 'images'"
echo "  - Max file size: 5MB"
echo "  - Allowed types: JPEG, PNG, GIF, WebP"
echo ""
