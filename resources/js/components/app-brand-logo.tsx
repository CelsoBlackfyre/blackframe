import { cn } from '@/lib/utils';
import type { ImgHTMLAttributes } from 'react';

type AppBrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'>;

export default function AppBrandLogo({ className, alt = 'BlackFrame', ...props }: AppBrandLogoProps) {
    return (
        <img
            src="/images/blackframe_logo.png"
            width="1254"
            height="1254"
            alt={alt}
            draggable={false}
            className={cn('object-contain select-none', className)}
            {...props}
        />
    );
}
