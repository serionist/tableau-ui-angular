import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    contentChildren,
    DoCheck,
    effect,
    ElementRef,
    inject,
    input,
    OnDestroy,
    OnInit,
    TemplateRef,
    viewChild,
    viewChildren,
} from '@angular/core';
import { TabTreeNodeComponent } from './tree-node.component';
import { debounceTime, Subject } from 'rxjs';
@Component({
    selector: 'tab-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TabTreeComponent
    implements AfterContentInit, OnDestroy
{
    selfElementRef = inject(ElementRef<HTMLElement>);
    showRootGridLines = input<boolean>(false);
    gridLinesBorder = input<string | undefined>(undefined);
    gridLinesBorderRadius = input<string>('0px');
    expandButtonSize = input<string>('1.2rem');
    expandButtonColor = input<string | undefined>(undefined);
    expandButtonGap = input<string | undefined>('0.2rem');
    expandButtonTooltip = input<
        | {
              expand: TemplateRef<any> | string | undefined;
              collapse: TemplateRef<any> | string | undefined;
              position: 'top' | 'bottom' | 'left' | 'right';
              margin?: string;
              context?: any | undefined;
          }
        | undefined
    >(undefined);
    expandButtonAlign = input<string>('center');
    childrenIndent = input<string>('1.4rem');
    keepButtonOffsetOnNoChildren = input<boolean>(true);

    children = contentChildren<TabTreeNodeComponent>(TabTreeNodeComponent, {
        descendants: true,
    });
    directChildren = contentChildren(TabTreeNodeComponent);
    templateParams = {
        childrenIndent: this.childrenIndent,
        expandButtonSize: this.expandButtonSize,
        expandButtonColor: this.expandButtonColor,
        expandButtonGap: this.expandButtonGap,
        expandButtonTooltip: this.expandButtonTooltip,
        expandButtonAlign: this.expandButtonAlign,
        keepButtonOffsetOnNoChildren: this.keepButtonOffsetOnNoChildren,
    };
    constructor() {
        effect(() => {
            for (const [index, child] of this.directChildren().entries()) {
                child.depth.set(this.showRootGridLines() ? 1: 0);
                child.id.set(`${index}`);
            }
            if (this.gridLinesBorder()) {
                this.redrawGridLines();
            }
        });
        this.resizeCommand.pipe(debounceTime(10)).subscribe(() => {
            this.redrawGridLines();
        });
    }

    shouldShowNode(child: TabTreeNodeComponent) {
        let p: TabTreeNodeComponent | null = child.parent;
        while (p) {
            if (!p.expanded()) {
                return false;
            }
            p = p.parent;
        }
        return true;
    }
    private resizeObserver!: ResizeObserver;
    private resizeCommand = new Subject<void>();
    ngAfterContentInit(): void {
        this.resizeObserver = new ResizeObserver(() => {
            this.resizeCommand.next();
        });
        this.resizeObserver.observe(this.selfElementRef.nativeElement);
    }
    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
    }

    existingGridLines: {
        id: string;
        element: HTMLDivElement;
    }[] = [];
    redrawGridLines() {
        if (this.gridLinesBorder() === undefined) {
            return;
        }
        const gridLines: {
            id: string;
            from: { top: number; left: number };
            to: { top: number; left: number };
        }[] = [];
        for (let child of this.children()) {
            // root gridlines
            if (this.showRootGridLines() && !child.parent) { 
                const selfRect =
                    this.selfElementRef.nativeElement.getBoundingClientRect();
                const buttonRect = child
                    .headerButton()
                    ?.nativeElement?.nativeElement?.getBoundingClientRect();
                if (!selfRect || !buttonRect) {
                  
                    continue;
                }
                gridLines.push({
                    id: child.id(),
                    from: {
                        top: 0,
                        left: 0,
                    },
                    to: {
                        top:
                        buttonRect.top - selfRect.top + buttonRect.height / 2,
                        left:
                        buttonRect.x -
                            selfRect.x +
                            (child.children().length === 0 ? buttonRect.width : 0),
                    },
                });
                continue;
                
            }
            // show children gridlines
            if (
                child.depth() === 0 ||
                !child.parent ||
                !child.parent.expanded() ||
                child.parent.headerButton() === undefined
            ) {
                continue;
            }

            const selfRect =
                this.selfElementRef.nativeElement.getBoundingClientRect();
            const parentButtonRect = child.parent
                .headerButton()
                ?.nativeElement?.nativeElement?.getBoundingClientRect();
            const buttonRect = child
                .headerButton()
                ?.nativeElement?.nativeElement?.getBoundingClientRect();

            if (!selfRect || !parentButtonRect || !buttonRect) {
                continue;
            }

            gridLines.push({
                id: child.id(),
                from: {
                    top: parentButtonRect.top - selfRect.top + parentButtonRect.height,
                    left:
                    parentButtonRect.x - selfRect.left + parentButtonRect.width / 2,
                },
                to: {
                    top:
                    buttonRect.top - selfRect.top + buttonRect.height / 2,
                    left:
                    buttonRect.x -
                        selfRect.x +
                        (child.children().length === 0 ? buttonRect.width : 0),
                },
            });
        }
        // get the gridlines that we do not need
        const gridLinesToRemove = this.existingGridLines.filter(
            (line) => !gridLines.find((l) => l.id === line.id)
        );
        for (const line of gridLinesToRemove) {
            line.element.remove();
        }
        // remove the gridlines from the existingGridLines array
        this.existingGridLines = this.existingGridLines.filter(
            (line) => !gridLinesToRemove.find((l) => l.id === line.id)
        );
        // add the new gridlines to the existingGridLines array
        for (const line of gridLines) {
            let l = this.existingGridLines.find((l) => l.id === line.id);
            if (!l) {
                l = {
                    id: line.id,
                    element: document.createElement('div'),
                };
                l.element.className = 'grid-line';
                l.element.style.position = 'absolute';
                this.selfElementRef.nativeElement.appendChild(l.element);
                this.existingGridLines.push(l);
            }
            l.element.style.top = `${line.from.top}px`;
            l.element.style.left = `${line.from.left}px`;
            l.element.style.width = `${line.to.left - line.from.left}px`;
            l.element.style.height = `${line.to.top - line.from.top}px`;
            l.element.style.pointerEvents = 'none';
            l.element.style.borderBottom =
                this.gridLinesBorder()!;
            // only draw the left border if its the last child of the parent
            l.element.style.borderLeft =
                this.gridLinesBorder()!;

            l.element.style.borderBottomLeftRadius = this.gridLinesBorderRadius();
        }
    }
}
