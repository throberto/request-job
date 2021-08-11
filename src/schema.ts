import {
  makeSchema,
  objectType,
  queryType,
  mutationType,
  nonNull,
  inputObjectType,
  arg,
  enumType,
} from 'nexus'

const Query = queryType({
  definition(t) {
    t.list.nonNull.field('allDepartments', {
      type: Department,
      resolve: (_, __, ctx) => {
        return ctx.prisma.department.findMany()
      },
    })

    t.list.nonNull.field('allCustomers', {
      type: Customer,
      resolve: (_, __, ctx) => {
        return ctx.prisma.customer.findMany()
      },
    })

    t.list.nonNull.field('allJobs', {
      type: Job,
      resolve: (_, __, ctx) => {
        return ctx.prisma.job.findMany()
      },
    })
  },
})

const Mutation = mutationType({
  definition(t) {
    t.nonNull.field('createDepartment', {
      type: Department,
      args: { data: nonNull(arg({ type: DepartmentCreateInput })) },
      resolve: (_, { data }, ctx) => {
        const { name } = data

        return ctx.prisma.department.create({
          data: { name },
        })
      },
    })

    t.nonNull.field('createCustomer', {
      type: Customer,
      args: { data: nonNull(arg({ type: CustomerCreateInput })) },
      resolve: (_, { data }, ctx) => {
        const { name, departmentId } = data

        return ctx.prisma.customer.create({
          data: {
            name,
            department: {
              connect: { id: departmentId },
            },
          },
        })
      },
    })

    t.nonNull.field('createJob', {
      type: Job,
      args: { data: nonNull(arg({ type: JobCreateInput })) },
      resolve: (_, { data }, ctx) => {
        const { detail, customerId } = data

        return ctx.prisma.job.create({
          data: {
            detail,
            customer: {
              connect: { id: customerId },
            },
          },
        })
      },
    })
  },
})

const Department = objectType({
  name: 'Department',
  definition(t) {
    t.nonNull.id('id')
    t.nonNull.string('name')
  },
})

const DepartmentCreateInput = inputObjectType({
  name: 'DepartmentCreateInput',
  definition(t) {
    t.nonNull.string('name')
  },
})

const Customer = objectType({
  name: 'Customer',
  definition(t) {
    t.nonNull.id('id')
    t.nonNull.string('name')
    t.field('department', {
      type: Department,
      resolve({ id }, __, ctx) {
        return ctx.prisma.customer
          .findUnique({
            where: { id },
          })
          .department()
      },
    })
  },
})

const CustomerCreateInput = inputObjectType({
  name: 'CustomerCreateInput',
  definition(t) {
    t.nonNull.string('name')
    t.nonNull.id('departmentId')
  },
})

const Job = objectType({
  name: 'Job',
  definition(t) {
    t.nonNull.id('id')
    t.nonNull.string('detail')
    t.nonNull.field('status', { type: JobStatusEnum })
    t.field('customer', {
      type: Customer,
      resolve({ id }, __, ctx) {
        return ctx.prisma.job
          .findUnique({
            where: { id },
          })
          .customer()
      },
    })
  },
})

const JobCreateInput = inputObjectType({
  name: 'JobCreateInput',
  definition(t) {
    t.nonNull.string('detail')
    t.nonNull.id('customerId')
  },
})

const JobStatusEnum = enumType({
  name: 'JobStatusEnum',
  members: {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
  },
})

export const schema = makeSchema({
  types: [Query, Mutation, Department, Customer, Job, JobStatusEnum],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
