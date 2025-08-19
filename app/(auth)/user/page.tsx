'use client'
import { SignupForm } from "@/mycomponents/signup"
import { LoginForm } from "@/components/login-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import React from 'react'

type Props = {}

const SigninUp = (props: Props) => {
  return (
    <Tabs defaultValue="signup" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="signin">Login</TabsTrigger>
    <TabsTrigger value="signup">Sign up</TabsTrigger>
  </TabsList>
  <TabsContent value="signin"><LoginForm /></TabsContent>
  <TabsContent value="signup"> <SignupForm /></TabsContent>
</Tabs>
  )
}

export default SigninUp



