"use server"

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { error } from "console";
import { revalidatePath } from "next/cache";



export async function syncUser() {
    try {
        const { userId } = await auth()
        const user = await currentUser()

        if (!user || !userId) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })
        if (existingUser) return existingUser;

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            },
        });
        return dbUser
    } catch (error) {
        console.log("Error in syncUser", error);
    }
}
export async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
        where: {
            clerkId
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true
                }
            }
        }
    })
}
export async function getDbUserId() {
    const { userId: clerkId } = await auth()
    if (!clerkId) return null

    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error("User Not Found")
    return user.id
}
export async function getRandomUsers() {
    try {
        const userId = await getDbUserId();

        if (!userId) return [];

        // get 3 random users exclude ourselves & users that we already follow
        const randomUsers = await prisma.user.findMany({
            where: {
                AND: [
                    { NOT: { id: userId } },
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: userId,
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },
            take: 3,
        });

        return randomUsers;
    } catch (error) {
        console.log("Error fetching random users", error);
        return [];
    }
}
export async function toggleFollow(targetUserId: string) {
    try {
        const userId = await getDbUserId();

        if (!userId) return;

        if (userId === targetUserId) throw new Error("You cannot follow yourself");

        const existingFollow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId,
                },
            },
        });

        if (existingFollow) {
            // unfollow
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetUserId,
                    },
                },
            });
        } else {
            // follow
            await prisma.$transaction([
                prisma.follows.create({
                    data: {
                        followerId: userId,
                        followingId: targetUserId,
                    },
                }),

                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: targetUserId, // user being followed
                        creatorId: userId, // user following
                    },
                }),
            ]);
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return { success: false, error: "Error toggling follow" };
    }
}

export async function searchUsers(query:string){
    if(!query.trim()) return []
    const userId = await getDbUserId()
    if(!userId) return [];

    try {
        const users = await prisma.user.findMany({
            where:{
                AND: [
                    //excluding yourself
                    { NOT: { id: userId } },
                    {OR:[
                        {
                            name:{
                            contains:query,
                            mode:"insensitive"
                        }},
                        {
                            username:{
                                contains:query,
                                mode:"insensitive"
                            }
                        }

                ]}

                ]

            },
            select:{
                id:true,
                name:true,
                username:true,
                image:true
            },
            take:20
            ,orderBy:{
                createdAt:"desc"
            }
        })
        return users
    } catch (error) {
        console.log("Error finding users")
        return []
    }
}