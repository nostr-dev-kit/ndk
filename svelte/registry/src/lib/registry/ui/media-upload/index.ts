import Root from './media-upload-root.svelte';
import Button from './media-upload-button.svelte';
import Preview from '../../components/media-upload-preview.svelte';
import Carousel from './media-upload-carousel.svelte';
import Item from './media-upload-item.svelte';

export { createMediaUpload, type MediaUploadResult, type MediaUploadOptions } from './createMediaUpload.svelte.js';

export const MediaUpload = {
	Root,
	Button,
	Preview,
	Carousel,
	Item
};
