import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
// import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

/**
 *
 * @param {*} props
 * @data item list {id:string, sname||name:string, name||sname:string}
 * @dflt {string} default item id
 * @limit {string|nuber} toggle limit
 * @label {string} SELECT label
 * @allowAll {bool} allow item all
 * @fcb callback function
 * @returns
 */

// import React, { useState, useEffect } from 'react';
// import {
//   Box, ToggleButton, ToggleButtonGroup,
//   FormControl, InputLabel, Select, MenuItem
// } from '@mui/material';

export interface VkToggleDataType {
  id: string;
  sname?: string;
  name?: string;
}

interface VkTogglePropsType extends React.ComponentPropsWithoutRef<typeof Box> {
  data: VkToggleDataType[];
  dflt?: string;
  limit?: number;
  label?: string;
  allowAll?: boolean;
  fcb?: (id: string) => void;
}

export const VkToggle = ({
  data,
  dflt = '',
  limit = 5,
  label = '',
  allowAll = true,
  fcb,
  ...other
}: VkTogglePropsType) => {
  const [crnt, setCrnt] = useState(dflt);

  // Синхронізація внутрішнього стану, якщо dflt зміниться ззовні
  useEffect(() => {
    setCrnt(dflt);
  }, [dflt]);

  const handleChange = (newValue: string) => {
    setCrnt(newValue);
    if (fcb) fcb(newValue); // Викликаємо відразу, без useEffect
  };

  const showAll = allowAll && data.length > 1;

  // Спільний рендер кнопки "Всі"
  const renderAllItem = (isSelect: boolean) => {
    if (!showAll) return null;
    return isSelect ? (
      <MenuItem key="all" value="" divider sx={{ fontWeight: 'bold' }}>
        Всі
      </MenuItem>
    ) : (
      <ToggleButton key="all" value="">
        Всі
      </ToggleButton>
    );
  };

  return (
    <Box {...other}>
      <FormControl size="small" fullWidth={data.length > limit}>
        {data.length <= limit ? (
          <ToggleButtonGroup
            value={crnt}
            exclusive
            size="small"
            onChange={(_, val) => val !== null && handleChange(val)}
          >
            {renderAllItem(false)}
            {data.map((v) => (
              <ToggleButton key={v.id} value={v.id}>
                {v.sname ?? v.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : (
          <>
            <InputLabel id="vk-toggle-label">{label}</InputLabel>
            <Select
              labelId="vk-toggle-label"
              value={crnt}
              label={label}
              displayEmpty
              onChange={(e) => handleChange(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              {renderAllItem(true)}
              {data.map((v) => (
                <MenuItem key={`item-${v.id}`} value={v.id}>
                  {v.name ?? v.sname}
                </MenuItem>
              ))}
            </Select>
          </>
        )}
      </FormControl>
    </Box>
  );
};
