// This file is run before every test file
import '@testing-library/jest-dom';

// Make React global to prevent duplicate React instance issues
import * as React from 'react';
global.React = React;
