# Media Optimization with NDK-Blossom

The Blossom protocol supports media optimization (BUD-05), which allows you to request optimized versions of media blobs. This is useful for:

- **Reducing bandwidth usage**: Getting smaller versions of images for thumbnails
- **Adapting to different devices**: Serving appropriate image sizes for different screens
- **Converting formats**: Accessing media in different formats (e.g., WebP, AVIF)

NDK-Blossom provides easy access to these optimization features.

## Getting Optimized Images

To get an optimized version of an image:

```typescript
// Basic optimization with default settings
const optimizedUrl = await blossom.getOptimizedUrl(
    'https://blossom.example.com/abcdef123456...'
);

// Optimization with specific parameters
const thumbnailUrl = await blossom.getOptimizedUrl(
    'https://blossom.example.com/abcdef123456...',
    {
        width: 300,
        height: 200,
        format: 'webp',
        quality: 85
    }
);

// Use the optimized URL
document.getElementById('thumbnail').src = thumbnailUrl;
```

## Optimization Options

NDK-Blossom supports the following optimization parameters:

```typescript
// All available options
const options = {
    // Dimensions
    width: 800,          // Requested width in pixels
    height: 600,         // Requested height in pixels
    
    // Format conversion
    format: 'webp',      // Target format: 'jpeg', 'png', 'webp', 'avif', etc.
    
    // Quality settings
    quality: 80,         // Quality percentage (1-100)
    
    // Resizing behavior
    fit: 'contain',      // 'contain', 'cover', 'fill', 'inside', 'outside'
    
    // Background options (for formats with transparency or when padding is needed)
    background: '#ffffff',  // Background color
    
    // Advanced options
    blur: 5,             // Apply blur effect (radius)
    sharpen: true,       // Apply sharpening
    
    // Video specific (for video formats)
    time: '00:00:15',    // Timestamp for video frame extraction
};

const customUrl = await blossom.getOptimizedUrl(originalUrl, options);
```

## Optimization with Custom Headers

For more specific control, you can request optimization using custom headers:

```typescript
// Get a blob with custom optimization headers
const response = await blossom.getOptimizedBlob(
    'https://blossom.example.com/abcdef123456...',
    {
        format: 'webp',
        width: 400
    },
    {
        'X-Custom-Header': 'value'
    }
);

// Process the response
if (response.ok) {
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    document.getElementById('image').src = objectUrl;
}
```

## Automatic Responsive Images

NDK-Blossom can help you implement responsive images:

```typescript
// Generate srcset for responsive images
const srcset = blossom.generateSrcset(
    'https://blossom.example.com/abcdef123456...',
    [
        { width: 320, format: 'webp' },
        { width: 640, format: 'webp' },
        { width: 960, format: 'webp' },
        { width: 1280, format: 'webp' }
    ]
);

// Use the srcset in your HTML
const imgElement = document.createElement('img');
imgElement.srcset = srcset;
imgElement.sizes = '(max-width: 600px) 320px, (max-width: 1200px) 640px, 960px';
imgElement.src = 'https://blossom.example.com/abcdef123456...'; // Fallback
document.body.appendChild(imgElement);
```

## Server-Side Optimization Rules

If you're developing a server-side application, you can define optimization rules:

```typescript
// Define common optimization presets
const optimizationPresets = {
    thumbnail: {
        width: 200,
        height: 200,
        format: 'webp',
        fit: 'cover',
        quality: 80
    },
    preview: {
        width: 800,
        height: 600,
        format: 'webp',
        fit: 'contain',
        quality: 85
    },
    fullsize: {
        format: 'webp',
        quality: 90
    }
};

// Use a preset
const thumbnailUrl = await blossom.getOptimizedUrl(
    originalUrl,
    optimizationPresets.thumbnail
);
```

## Error Handling

Handle optimization errors appropriately:

```typescript
try {
    const optimizedUrl = await blossom.getOptimizedUrl(originalUrl, options);
    // Use the optimized URL
} catch (error) {
    console.error('Optimization failed:', error);
    
    if (error.code === 'SERVER_UNSUPPORTED') {
        // Server doesn't support optimization
        // Fall back to the original URL
        useOriginalUrl();
    } else if (error.code === 'FORMAT_UNSUPPORTED') {
        // Requested format is not supported
        // Try a different format
        tryDifferentFormat();
    } else {
        // Other error, use original URL
        useOriginalUrl();
    }
}
```

## Considerations

- Not all Blossom servers support optimization
- Different servers may support different formats and options
- Some servers may have limits on dimensions or quality
- Optimization might introduce additional latency 