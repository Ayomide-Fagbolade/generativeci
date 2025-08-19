import { CreateStory } from '@/mycomponents/createstory'
import ProtectedRoute from '@/mycomponents/protectedRoute'
import { RetrieveStory } from '@/mycomponents/retrievestories'
import { SignOutButton } from '@/mycomponents/signout'
import React from 'react'
type Props = {}

const page = (props: Props) => {
  return (
   <ProtectedRoute requiredRole="admin"><>

    <div>page</div>
    <CreateStory/>
    <RetrieveStory/>
 
    </></ProtectedRoute>
  )
}

export default page