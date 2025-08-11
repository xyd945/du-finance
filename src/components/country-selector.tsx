'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { CountryConfig } from '@/types';
import { clsx } from 'clsx';

interface CountrySelectorProps {
  countries: CountryConfig[];
  selectedCountry: string;
  onCountrySelect: (countryCode: string) => void;
  className?: string;
}

export function CountrySelector({
  countries,
  selectedCountry,
  onCountrySelect,
  className,
}: CountrySelectorProps) {
  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  return (
    <div className={clsx('w-48', className)}>
      <Listbox value={selectedCountry} onChange={onCountrySelect}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <span className="flex items-center">
              {selectedCountryData && (
                <span className="text-lg mr-2">
                  {getFlagEmoji(selectedCountryData.flag)}
                </span>
              )}
              <span className="ml-1 block truncate">
                {selectedCountryData?.name || selectedCountry}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {countries.map(country => (
                <Listbox.Option
                  key={country.code}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-blue-600 text-white' : 'text-gray-900'
                    )
                  }
                  value={country.code}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {getFlagEmoji(country.flag)}
                        </span>
                        <span
                          className={clsx(
                            'ml-1 block truncate',
                            selected ? 'font-medium' : 'font-normal'
                          )}
                        >
                          {country.name}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={clsx(
                            'absolute inset-y-0 right-0 flex items-center pr-4',
                            active ? 'text-white' : 'text-blue-600'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  // Convert country code to flag emoji
  // This is a simple implementation - you might want to use a more comprehensive mapping
  const flagMap: Record<string, string> = {
    US: '🇺🇸',
    GB: '🇬🇧',
    DE: '🇩🇪',
    FR: '🇫🇷',
    JP: '🇯🇵',
    CN: '🇨🇳',
    CA: '🇨🇦',
    AU: '🇦🇺',
    IT: '🇮🇹',
    ES: '🇪🇸',
    // Add more mappings as needed
  };

  return flagMap[countryCode.toUpperCase()] || '🏳️';
}
