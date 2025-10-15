"use client";

// External libraries
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

// Internal libraries/utilities
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { recurrenceEngine } from '@/utils/recurrenceEngine';

// Types
import type { RecurrencePattern } from '@/utils/recurrenceEngine';

interface RecurrencePatternSelectorProps {
  readonly pattern: RecurrencePattern | null;
  readonly onPatternChange: (pattern: RecurrencePattern | null) => void;
  readonly disabled?: boolean;
}

/**
 * RecurrencePatternSelector Component
 * 
 * Allows users to configure recurring booking patterns with various options:
 * - Weekly patterns with specific weekdays
 * - Biweekly patterns
 * - Monthly patterns with specific occurrences
 * - Custom intervals
 * 
 * Features:
 * - Visual weekday selection
 * - Monthly pattern configuration
 * - Custom interval support
 * - Date range selection
 * - Pattern validation
 * - Human-readable descriptions
 * 
 * Usage:
 * - Use pattern to control the current pattern
 * - Use onPatternChange to handle pattern changes
 * - Use disabled to prevent interaction when needed
 */
export function RecurrencePatternSelector({ 
  pattern, 
  onPatternChange, 
  disabled = false 
}: RecurrencePatternSelectorProps): JSX.Element {
  const [localPattern, setLocalPattern] = useState<RecurrencePattern>(
    pattern || {
      type: 'weekly',
      weekdays: [1, 2, 3, 4, 5],
      timeSlots: ['09:00-11:00'],
      interval: 1
    }
  );
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const weekdays = [
    { id: 0, name: 'Søndag', short: 'Søn' },
    { id: 1, name: 'Mandag', short: 'Man' },
    { id: 2, name: 'Tirsdag', short: 'Tir' },
    { id: 3, name: 'Onsdag', short: 'Ons' },
    { id: 4, name: 'Torsdag', short: 'Tor' },
    { id: 5, name: 'Fredag', short: 'Fre' },
    { id: 6, name: 'Lørdag', short: 'Lør' }
  ];

  const monthlyPatterns = [
    { id: 'first', label: 'Første' },
    { id: 'second', label: 'Andre' },
    { id: 'third', label: 'Tredje' },
    { id: 'fourth', label: 'Fjerde' },
    { id: 'last', label: 'Siste' }
  ];

  // Call onPatternChange when pattern changes
  const updatePattern = (newPattern: RecurrencePattern) => {
    setLocalPattern(newPattern);
    if (newPattern.type !== 'single') {
      onPatternChange(newPattern);
    }
  };

  const handleTypeChange = (type: RecurrencePattern['type']) => {
    const newPattern: RecurrencePattern = {
      type,
      weekdays: type === 'single' ? [] : localPattern.weekdays,
      timeSlots: localPattern.timeSlots,
      interval: localPattern.interval,
      startDate: localPattern.startDate,
      endDate: localPattern.endDate,
      monthlyPattern: type === 'monthly' ? (localPattern.monthlyPattern || 'first') : undefined,
      monthlyWeekday: type === 'monthly' ? (localPattern.monthlyWeekday || 1) : undefined,
      maxOccurrences: localPattern.maxOccurrences
    };
    updatePattern(newPattern);
  };

  const handleWeekdayToggle = (weekday: number) => {
    const newWeekdays = localPattern.weekdays.includes(weekday)
      ? localPattern.weekdays.filter(d => d !== weekday)
      : [...localPattern.weekdays, weekday];
    
    updatePattern({
      ...localPattern,
      weekdays: newWeekdays
    });
  };

  const handleIntervalChange = (interval: number) => {
    updatePattern({
      ...localPattern,
      interval: Math.max(1, interval)
    });
  };

  const handleMonthlyPatternChange = (monthlyPattern: RecurrencePattern['monthlyPattern']) => {
    updatePattern({
      ...localPattern,
      monthlyPattern
    });
  };

  const handleMonthlyWeekdayChange = (monthlyWeekday: number) => {
    updatePattern({
      ...localPattern,
      monthlyWeekday
    });
  };

  const handleEndDateChange = (endDate: Date | undefined) => {
    updatePattern({
      ...localPattern,
      endDate
    });
  };

  const handleMaxOccurrencesChange = (maxOccurrences: number) => {
    updatePattern({
      ...localPattern,
      maxOccurrences: Math.max(1, maxOccurrences)
    });
  };

  const validation = recurrenceEngine.validatePattern(localPattern);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Gjentakende mønster
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pattern Type Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Velg mønster
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'weekly', label: 'Ukentlig', description: 'Hver uke' },
              { id: 'biweekly', label: 'Annenhver uke', description: 'Hver 2. uke' },
              { id: 'monthly', label: 'Månedlig', description: 'Hver måned' },
              { id: 'custom', label: 'Egendefinert', description: 'Tilpasset intervall' }
            ].map((type) => (
              <Button
                key={type.id}
                variant={localPattern?.type === type.id ? 'default' : 'outline'}
                onClick={() => !disabled && handleTypeChange(type.id as RecurrencePattern['type'])}
                disabled={disabled}
                className="h-auto p-3 flex flex-col items-center space-y-1"
              >
                <span className="font-medium">{type.label}</span>
                <span className={`text-xs ${localPattern?.type === type.id ? 'text-white' : 'text-gray-600'}`}>
                  {type.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Weekday Selection (for weekly, biweekly, custom) */}
        {localPattern && (localPattern.type === 'weekly' || localPattern.type === 'biweekly' || localPattern.type === 'custom') && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Velg dager
            </Label>
            <div className="grid grid-cols-7 gap-2">
              {weekdays.map((weekday) => (
                <div key={weekday.id} className="flex flex-col items-center space-y-2">
                  <Checkbox
                    id={`weekday-${weekday.id}`}
                    checked={localPattern.weekdays.includes(weekday.id)}
                    onCheckedChange={() => !disabled && handleWeekdayToggle(weekday.id)}
                    disabled={disabled}
                  />
                  <Label 
                    htmlFor={`weekday-${weekday.id}`}
                    className="text-xs text-center cursor-pointer"
                  >
                    {weekday.short}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Pattern Selection */}
        {localPattern && localPattern.type === 'monthly' && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Hvilken uke i måneden
              </Label>
              <Select
                value={localPattern.monthlyPattern || 'first'}
                onValueChange={(value) => !disabled && handleMonthlyPatternChange(value as RecurrencePattern['monthlyPattern'])}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg uke" />
                </SelectTrigger>
                <SelectContent>
                  {monthlyPatterns.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Hvilken dag
              </Label>
              <Select
                value={localPattern.monthlyWeekday?.toString() || '1'}
                onValueChange={(value) => !disabled && handleMonthlyWeekdayChange(parseInt(value))}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg dag" />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((weekday) => (
                    <SelectItem key={weekday.id} value={weekday.id.toString()}>
                      {weekday.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Custom Interval */}
        {localPattern && localPattern.type === 'custom' && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Intervall (dager)
            </Label>
            <Input
              type="number"
              min="1"
              value={localPattern.interval || 1}
              onChange={(e) => !disabled && handleIntervalChange(parseInt(e.target.value) || 1)}
              disabled={disabled}
              className="w-32"
            />
          </div>
        )}

        {/* End Date Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Sluttdato (valgfri)
          </Label>
          <Popover open={showEndDatePicker} onOpenChange={setShowEndDatePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localPattern?.endDate ? format(localPattern.endDate, 'dd. MMMM yyyy') : 'Velg sluttdato'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localPattern.endDate}
                onSelect={(date) => {
                  handleEndDateChange(date);
                  setShowEndDatePicker(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Max Occurrences */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Maks antall forekomster (valgfri)
          </Label>
          <Input
            type="number"
            min="1"
            max="52"
            value={localPattern.maxOccurrences || ''}
            onChange={(e) => !disabled && handleMaxOccurrencesChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-32"
            placeholder="52"
          />
        </div>

        {/* Pattern Description */}
        {localPattern && (
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-900">
              <strong>Mønster:</strong> {recurrenceEngine.getPatternDescription(localPattern)}
            </p>
          </div>
        )}

        {/* Validation Errors */}
        {!validation.isValid && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">Feil i mønster:</p>
            <ul className="text-sm text-red-700 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
