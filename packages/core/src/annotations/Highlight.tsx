/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2024 Nguyen Huu Phuoc <me@phuoc.ng>
 */

'use client';

import * as React from 'react';
import styles from '../styles/annotation.module.css';
import { type PdfJs } from '../types/PdfJs';
import { Annotation } from './Annotation';
import { AnnotationType } from './AnnotationType';
import { Popup } from './Popup';
import { getContents } from './getContents';
import { getTitle } from './getTitle';

export const Highlight: React.FC<{
    annotation: PdfJs.Annotation;
    childAnnotation?: PdfJs.Annotation;
    page: PdfJs.Page;
    viewport: PdfJs.ViewPort;
}> = ({ annotation, childAnnotation, page, viewport }) => {
    const hasPopup = annotation.hasPopup === false;
    const title = getTitle(annotation);
    const contents = getContents(annotation);
    const isRenderable = !!(annotation.hasPopup || title || contents);

    // Check if the highlight area is constructed by multiple quadrilaterals
    if (annotation.quadPoints && annotation.quadPoints.length > 0) {
        // pdfjs-dist v4 returns quadPoints as a flat Float32Array
        // v3 returned AnnotationPoint[][]
        const raw = annotation.quadPoints as unknown as number[] | PdfJs.AnnotationPoint[][];
        const isFlat = typeof raw[0] === 'number';

        const quads: PdfJs.AnnotationPoint[][] = isFlat
            ? Array.from({ length: (raw as number[]).length / 8 }, (_, i) => {
                  const o = i * 8;
                  const flat = raw as number[];
                  return [
                      { x: flat[o], y: flat[o + 1] },
                      { x: flat[o + 2], y: flat[o + 3] },
                      { x: flat[o + 4], y: flat[o + 5] },
                      { x: flat[o + 6], y: flat[o + 7] },
                  ];
              })
            : (raw as PdfJs.AnnotationPoint[][]);

        const annotations = quads.map(
            (quadPoint) =>
                Object.assign({}, annotation, {
                    rect: [quadPoint[2].x, quadPoint[2].y, quadPoint[1].x, quadPoint[1].y],
                    // Reset the `quadPoints` property to avoid the infinitive loop
                    quadPoints: [],
                }) as PdfJs.Annotation,
        );
        return (
            <>
                {annotations.map((ann, index) => (
                    <Highlight
                        key={index}
                        annotation={ann}
                        childAnnotation={childAnnotation}
                        page={page}
                        viewport={viewport}
                    />
                ))}
            </>
        );
    }

    return (
        <Annotation
            annotation={annotation}
            hasPopup={hasPopup}
            ignoreBorder={true}
            isRenderable={isRenderable}
            page={page}
            viewport={viewport}
        >
            {(props): React.ReactElement => (
                <>
                    <div
                        {...props.slot.attrs}
                        className={styles.annotation}
                        data-annotation-id={annotation.id}
                        data-annotation-type="highlight"
                        onClick={props.popup.toggleOnClick}
                        onMouseEnter={props.popup.openOnHover}
                        onMouseLeave={props.popup.closeOnHover}
                    >
                        {props.slot.children}
                    </div>
                    {childAnnotation &&
                        childAnnotation.annotationType === AnnotationType.Popup &&
                        props.popup.opened && <Popup annotation={childAnnotation} page={page} viewport={viewport} />}
                </>
            )}
        </Annotation>
    );
};
