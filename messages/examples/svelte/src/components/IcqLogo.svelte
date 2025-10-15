<script lang="ts">
    let { size = 16 } = $props<{ size?: number }>();
</script>

<svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="display: inline-block; vertical-align: middle;"
>
    <!-- Classic ICQ flower logo -->
    <!-- Petals -->
    <g>
        <!-- Top petal -->
        <ellipse cx="16" cy="6" rx="4" ry="6" fill="#00CC00" transform="rotate(0 16 16)" />
        <!-- Top-right petal -->
        <ellipse cx="16" cy="6" rx="4" ry="6" fill="#00CC00" transform="rotate(45 16 16)" />
        <!-- Right petal -->
        <ellipse cx="16" cy="6" rx="4" ry="6" fill="#00CC00" transform="rotate(90 16 16)" />
        <!-- Bottom-right petal -->
        <ellipse cx="16" cy="6" rx="4" ry="6" fill="#00CC00" transform="rotate(135 16 16)" />
        <!-- Bottom petal -->
        <ellipse cx="16" cy="6" rx="4" ry="6" fill="#00CC00" transform="rotate(180 16 16)" />
        <!-- Bottom-left petal -->
        <ellipse cx="16" cy="6" rx="4" ry="6" fill="#00CC00" transform="rotate(225 16 16)" />
        <!-- Left petal -->
        <ellipse cx="16" cy="6" rx="4" ry="6" fill="#00CC00" transform="rotate(270 16 16)" />
        <!-- Top-left petal -->
        <ellipse cx="16" cy="6" rx="4" ry="6" fill="#00CC00" transform="rotate(315 16 16)" />
    </g>
    <!-- Center -->
    <circle cx="16" cy="16" r="5" fill="#FFD700" />
    <circle cx="16" cy="16" r="3.5" fill="#FFA500" />
</svg>
