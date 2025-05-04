export type KeyboardNavigationKey = 
  | 'Enter' 
  | 'Space' 
  | 'ArrowUp' 
  | 'ArrowDown' 
  | 'ArrowLeft' 
  | 'ArrowRight' 
  | 'Escape' 
  | 'Tab'
  | 'Home'
  | 'End';

export interface KeyboardHandlers {
  [key: string]: (event: React.KeyboardEvent) => void;
}

/**
 * Creates keyboard event handlers for accessible navigation
 * @param handlers Object mapping keyboard keys to event handlers
 * @returns Event handler function for onKeyDown
 */
export const createKeyboardHandler = (handlers: KeyboardHandlers) => {
  return (event: React.KeyboardEvent) => {
    // Normalize space key for consistency
    const key = event.key === ' ' ? 'Space' : event.key;
    
    // If the key has a handler, call it
    if (handlers[key]) {
      handlers[key](event);
    }
  };
};

/**
 * Creates a keyboard handler for navigating through a list of items
 * @param itemsLength Length of the list
 * @param currentIndex Current focused index
 * @param setCurrentIndex Function to update current index
 * @param direction 'horizontal' or 'vertical'
 * @param onEnter Optional callback when Enter is pressed
 * @returns Event handler function for onKeyDown
 */
export const createListNavigationHandler = (
  itemsLength: number,
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  direction: 'horizontal' | 'vertical' = 'vertical',
  onEnter?: (index: number) => void
) => {
  const verticalKeys: KeyboardHandlers = {
    ArrowUp: () => setCurrentIndex(Math.max(0, currentIndex - 1)),
    ArrowDown: () => setCurrentIndex(Math.min(itemsLength - 1, currentIndex + 1)),
  };

  const horizontalKeys: KeyboardHandlers = {
    ArrowLeft: () => setCurrentIndex(Math.max(0, currentIndex - 1)),
    ArrowRight: () => setCurrentIndex(Math.min(itemsLength - 1, currentIndex + 1)),
  };

  const commonKeys: KeyboardHandlers = {
    Home: () => setCurrentIndex(0),
    End: () => setCurrentIndex(itemsLength - 1),
  };

  if (onEnter) {
    commonKeys['Enter'] = () => onEnter(currentIndex);
    commonKeys['Space'] = () => onEnter(currentIndex);
  }

  return createKeyboardHandler({
    ...(direction === 'vertical' ? verticalKeys : horizontalKeys),
    ...commonKeys,
  });
};

/**
 * Makes an element focusable and activatable by keyboard events
 * @param onClick Click handler
 * @returns Props object with appropriate event handlers
 */
export const makeKeyboardAccessible = (onClick: () => void) => {
  return {
    role: 'button',
    tabIndex: 0,
    onClick,
    onKeyDown: createKeyboardHandler({
      Enter: onClick,
      Space: (e) => {
        e.preventDefault(); // Prevent page scroll on space
        onClick();
      },
    }),
  };
}; 