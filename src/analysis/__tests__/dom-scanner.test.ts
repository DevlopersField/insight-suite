import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scanImages } from '../dom-scanner';

describe('scanImages', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('should detect standard extensions', () => {
        const img = document.createElement('img');
        img.src = 'https://example.com/image.png';
        document.body.appendChild(img);

        const result = scanImages();
        expect(result[0].type).toBe('png');
    });

    it('should detect types from CDN query parameters', () => {
        const img = document.createElement('img');
        img.src = 'https://images.unsplash.com/photo-12345?format=webp&w=100';
        document.body.appendChild(img);

        const result = scanImages();
        expect(result[0].type).toBe('webp');
    });

    it('should detect types from path segments', () => {
        const img = document.createElement('img');
        img.src = 'https://example.com/assets/png/logo';
        document.body.appendChild(img);

        const result = scanImages();
        expect(result[0].type).toBe('png');
    });

    it('should detect types from data URLs', () => {
        const img = document.createElement('img');
        img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+';
        document.body.appendChild(img);

        const result = scanImages();
        // Since we split by + and take index 0
        expect(result[0].type).toBe('svg');
    });

    it('should fallback to keyword search if other patterns fail', () => {
        const img = document.createElement('img');
        img.src = 'https://example.com/dynamic-image-png-generator';
        document.body.appendChild(img);

        const result = scanImages();
        expect(result[0].type).toBe('png');
    });

    it('should prioritize webp/avif if highlighted', () => {
        const img = document.createElement('img');
        img.src = 'https://example.com/image.webp';
        document.body.appendChild(img);

        const result = scanImages();
        expect(result[0].type).toBe('webp');
    });

    it('should detect types from picture source', () => {
        const picture = document.createElement('picture');
        const source = document.createElement('source');
        source.type = 'image/webp';
        const img = document.createElement('img');
        img.src = 'https://example.com/image';
        picture.appendChild(source);
        picture.appendChild(img);
        document.body.appendChild(picture);

        const result = scanImages();
        expect(result[0].type).toBe('webp');
    });

    it('should normalize jpeg to jpg', () => {
        const img = document.createElement('img');
        img.src = 'https://example.com/photo.jpeg';
        document.body.appendChild(img);

        const result = scanImages();
        expect(result[0].type).toBe('jpg');
    });

    it('should handle images with no src', () => {
        const img = document.createElement('img');
        document.body.appendChild(img);

        const result = scanImages();
        expect(result[0].type).toBe('none');
    });
});
