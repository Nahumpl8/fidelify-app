import React from 'react';
import styled from 'styled-components';
import QRCode from 'react-qr-code';

/**
 * SmartCode
 * 
 * A wrapper component for rendering QR Codes.
 * (Barcode support was removed - standardizing on QR only)
 */
const SmartCode = ({
    value = '630120-816-306',
    fgColor = '#000000',
    bgColor = 'transparent',
    size = 120,
    ...props
}) => {
    return (
        <QRCodeWrapper>
            <QRCode
                value={value}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
                {...props}
            />
        </QRCodeWrapper>
    );
};

const QRCodeWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

export default SmartCode;
