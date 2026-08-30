import { cn } from '@/lib/utils';
import type { ImgHTMLAttributes } from 'react';

type AppLogoIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'>;

export default function AppLogoIcon({ className, alt = '', ...props }: AppLogoIconProps) {
    return (
        <img
            src="/images/blackframe_logo_textless.png"
            width="1254"
            height="1254"
            alt={alt}
            draggable={false}
            className={cn('shrink-0 object-contain select-none', className)}
            {...props}
        />
    );
}
