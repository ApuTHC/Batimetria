import {Fragment} from 'react'
import {Disclosure, Menu, Transition} from '@headlessui/react'
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline'
import {Link} from "react-router-dom";
import {useAuthStore} from "../store/auth";
import Logo from '../assets/logo.png'
import jwt_decode from "jwt-decode"
import {Token} from "../Interfaces";
import {useQuery} from "@tanstack/react-query";
import {get_solo_user} from "../api/users.ts";

const Header = () => {

    const token: string = useAuthStore.getState().access;
    const {isAuth} = useAuthStore()


    let is_admin : boolean;
    let user_id : number;

    if (isAuth) {
        const tokenDecoded: Token = jwt_decode(token)
        is_admin = tokenDecoded.is_staff;
        user_id = tokenDecoded.user_id;
    }


    const { data: user } = useQuery({
        queryKey: ['userh'],
        queryFn: () => get_solo_user(user_id)
    })
    

    function logOutFun() {
        useAuthStore.getState().logout()
        window.location.href = '/login'
    }

    function classNames(...classes: any) {
        return classes.filter(Boolean).join(' ')
    }

    // data array de productos

    return (
        <Disclosure as="nav" className="bg-grey dark:bg-gray-800">
            {({open}) => (
                <>
                    <div className="mx-auto max-w-screen-2xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">

                                <Disclosure.Button
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 dark:text-slate-200 dark:hover:text-slate-50">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center">

                                    <img
                                        className="hidden h-8 w-auto lg:block"
                                        src={Logo}
                                        alt="Logo"
                                    />
                                </div>


                                <div className="hidden sm:ml-6 sm:block">

                                    <div className="flex space-x-4">

                                        {isAuth ? null : (
                                            <>
                                                <Link
                                                    to={'/login'}
                                                    className='bg-slate-400 p-2 px-4 rounded-lg dark:bg-gray-900 dark:text-white'
                                                >
                                                    Log in
                                                </Link>

                                            </>
                                        )}

                                        {is_admin && is_admin && (
                                            <>
                                            <Link
                                                to={'/'}
                                                className='p-2 px-4 rounded-lg hover:bg-slate-400 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                            >
                                               Visor
                                            </Link>
                                            <Link
                                                to={'/admin'}
                                                className='p-2 px-4 rounded-lg hover:bg-slate-400 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                            >
                                                Admin Panel
                                            </Link>
                                            </>
                                        )}


                                    </div>

                                </div>
                            </div>


                            <div
                                className="absolute space-x-2 inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

                                {isAuth && (
                                    <Menu as="div" className="relative ml-2">
                                        <div>
                                            <Menu.Button className="flex rounded-full ml-8 text-sm focus:outline-none ">
                                                <span className="sr-only">Open user menu</span>
                                                {user && user.avatar !== undefined &&
                                                <img
                                                    className="h-8 w-8 rounded-full"
                                                    src={`${import.meta.env.VITE_BACKEND_URL}${user.avatar}`}
                                                    alt=""
                                                />
                                                }
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items
                                                className="absolute right-0 mt-2 w-48 origin-top-right bg-dark dark:bg-slate-950 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none menuPerfil">
                                                {/*<Menu.Item>*/}
                                                {/*    {({active}) => (*/}
                                                {/*        <Link*/}
                                                {/*            to="/profile"*/}
                                                {/*            className={classNames(active ? 'bg-gray-100 dark:bg-slate-700' : '', 'block px-4 py-2 text-sm text-gray-700 dark:text-slate-200')}*/}
                                                {/*        >*/}
                                                {/*            Your Profile*/}
                                                {/*        </Link>*/}
                                                {/*    )}*/}
                                                {/*</Menu.Item>*/}
                                                <Menu.Item>
                                                    {({active}) => (
                                                        <span
                                                            onClick={logOutFun}
                                                            className={classNames(active ? 'bg-gray-100 dark:bg-slate-700' : '', 'block px-4 py-2 text-sm text-gray-700 cursor-pointer dark:text-slate-200')}
                                                        >
                                                          Sign out
                                                        </span>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>

                                )}

                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">

                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {/*       item.current ? 'bg-slate-400 text-black dark:bg-gray-900 dark:text-white' : */}
                            {/*         'text-black hover:bg-slate-400 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white', */}
                            {/* 'block rounded-md px-3 py-2 text-base font-medium' */}
                            {isAuth ? null: (
                                <div className="w-full grid grid-cols-1">
                                    <Link
                                        to={'/login'}
                                        className='bg-slate-400 p-2 px-4 rounded-lg dark:bg-gray-900 dark:text-white'
                                    >
                                        Log in
                                    </Link>
                                </div>
                            )}

                            {is_admin && (
                                <div className="w-full">
                                    <div className="w-full grid grid-cols-1">
                                        <Link
                                            to={'/'}
                                            className='bg-slate-400 p-2 px-4 rounded-lg  dark:bg-gray-900 dark:text-white'
                                        >
                                            Visor
                                        </Link>
                                    </div>
                                    <Link
                                        to={'/admin'}
                                        className='p-2 px-4 rounded-lg hover:bg-slate-400 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                    >
                                        Admin Panel
                                    </Link>
                                </div>
                            )}

                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}

export default Header
